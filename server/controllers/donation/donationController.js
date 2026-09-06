const Donation = require('../../models/Donation');
const CampInventory = require('../../models/CampInventory');
const { generateDonationId } = require('../../utils/generateId');
const { DONATION_STATUS, DONATION_TRANSITIONS } = require('../../utils/constants');
const { syncReliefNeeds } = require('../../services/campService');
const DonationDelivery = require('../../models/DonationDelivery');
const { applyInventoryChange } = require('../../services/inventoryTransactionService');
const { writeAudit } = require('../../services/auditService');
const { createNotification } = require('../../services/notificationService');
const { required } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');

async function createPledge(req, res, next) {
  try {
    const missing = required(['camp', 'itemName', 'quantity'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);

    const donation = await Donation.create({
      donationId: await generateDonationId(),
      donorName: req.body.donorName || req.user.fullName,
      donorEmail: req.body.donorEmail || req.user.email || '',
      donorPhone: req.body.donorPhone || '',
      donorUser: req.user._id,
      camp: req.body.camp,
      itemName: req.body.itemName,
      quantity,
      pledgedQuantity: quantity,
      status: DONATION_STATUS.PLEDGED,
      donorType: req.body.donorType || 'Individual',
      reliefRequest: req.body.reliefRequest || undefined,
      notes: req.body.notes || '',
    });

    const { metrics } = require('../../services/reliefEngine');
    const item = await CampInventory.findOne({ camp: donation.camp, itemName: donation.itemName });
    let warning = null;
    if (item) {
      const before = metrics(item);
      if (before.projectedShortage <= 0 && !req.body.excessOverride) {
        throw new AppError('This camp currently has sufficient projected supply. Consider supporting another verified need.', 409);
      }
      if (quantity > before.projectedShortage && !req.body.excessOverride) {
        throw new AppError(`Verified shortage is ${before.projectedShortage}. An administrator must allow excess allocation.`, 409);
      }
      if (before.projectedShortage <= 0) {
        warning = 'This camp currently has sufficient projected supply. Consider supporting another verified need.';
      } else if (quantity > before.projectedShortage) {
        warning = `This pledge exceeds the verified shortage of ${before.projectedShortage}. Excess was authorised.`;
      }
      item.incoming += quantity;
      await item.save();
      await syncReliefNeeds(donation.camp);
    }

    const populated = await Donation.findById(donation._id).populate('camp', 'name campId district');
    res.status(201).json({ success: true, donation: populated, warning });
  } catch (error) {
    next(error);
  }
}

async function listDonations(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.campId) filter.camp = req.query.campId;
    if (req.query.mine === 'true' && req.user) filter.donorUser = req.user._id;
    const donations = await Donation.find(filter).populate('camp', 'name campId district').sort({ createdAt: -1 });
    const safe = !req.user
      ? donations.map((row) => {
        const plain = row.toObject();
        delete plain.donorEmail;
        delete plain.donorPhone;
        plain.donorName = plain.donorType || 'Donor';
        return plain;
      })
      : donations;
    res.json({ success: true, donations: safe });
  } catch (error) {
    next(error);
  }
}

async function updateStatus(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    const nextStatus = req.body.status;
    if (!Object.values(DONATION_STATUS).includes(nextStatus)) {
      throw new AppError('Invalid donation status', 400);
    }
    const allowed = DONATION_TRANSITIONS[donation.status] || [];
    if (!allowed.includes(nextStatus) && req.user.role !== 'admin') {
      throw new AppError(`Cannot change a ${donation.status} donation to ${nextStatus}`, 409);
    }

    const previous = donation.status;
    donation.status = nextStatus;

    if (nextStatus === DONATION_STATUS.RECEIVED && !donation.inventoryUpdated) {
      donation.receivedAt = new Date();
      const item = await CampInventory.findOne({ camp: donation.camp, itemName: donation.itemName });
      if (item) {
        item.current += donation.quantity;
        item.incoming = Math.max(0, item.incoming - donation.quantity);
        item.recalculatePriority();
        await item.save();
        await syncReliefNeeds(donation.camp);
      }
      donation.inventoryUpdated = true;
      await writeAudit({
        user: req.user,
        action: 'Donation received',
        entityType: 'Donation',
        entityId: donation.donationId,
        metadata: { itemName: donation.itemName, quantity: donation.quantity },
        ip: req.ip,
      });
      await createNotification({
        audience: 'role',
        role: 'admin',
        title: 'Donation received',
        body: `${donation.quantity} ${donation.itemName} received for a relief camp.`,
        type: 'donation_received',
      });
    }

    if (nextStatus === DONATION_STATUS.DISTRIBUTED) {
      donation.distributedAt = new Date();
      const item = await CampInventory.findOne({ camp: donation.camp, itemName: donation.itemName });
      if (item) {
        item.distributed += donation.quantity;
        await item.save();
      }
    }

    if (nextStatus === DONATION_STATUS.IN_TRANSIT && previous === DONATION_STATUS.PLEDGED) {
      await writeAudit({
        user: req.user,
        action: 'Donation updated',
        entityType: 'Donation',
        entityId: donation.donationId,
        metadata: { status: nextStatus },
        ip: req.ip,
      });
    }

    await donation.save();
    const populated = await Donation.findById(donation._id).populate('camp', 'name campId district');
    res.json({ success: true, donation: populated });
  } catch (error) {
    next(error);
  }
}

async function verifyReceipt(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    const expected = Number(req.body.expectedQuantity ?? donation.quantity);
    const received = Number(req.body.receivedQuantity);
    if (!Number.isFinite(received) || received < 0) throw new AppError('Received quantity is required', 400);
    const discrepancy = expected - received;
    const delivery = await DonationDelivery.create({
      donation: donation._id,
      camp: donation.camp,
      expectedQuantity: expected,
      receivedQuantity: received,
      discrepancy,
      verifiedBy: req.user._id,
      notes: req.body.notes || '',
    });
    donation.receivedQuantity = received;
    donation.receivedAt = new Date();
    donation.status = discrepancy > 0 ? DONATION_STATUS.PARTIALLY_RECEIVED : DONATION_STATUS.RECEIVED;
    if (!donation.inventoryUpdated) {
      await applyInventoryChange({
        campId: donation.camp,
        itemName: donation.itemName,
        quantity: received,
        type: 'Received',
        source: donation.donationId,
        donation: donation._id,
        user: req.user,
        incomingDelta: -donation.quantity,
        notes: discrepancy ? `Discrepancy ${discrepancy}` : 'Verified receipt',
      });
      donation.inventoryUpdated = true;
      donation.status = DONATION_STATUS.IN_INVENTORY;
    }
    await donation.save();
    await writeAudit({
      user: req.user,
      action: discrepancy ? 'Delivery discrepancy recorded' : 'Donation received',
      entityType: 'Donation',
      entityId: donation.donationId,
      metadata: { expected, received, discrepancy },
      ip: req.ip,
    });
    const populated = await Donation.findById(donation._id).populate('camp', 'name campId');
    const beforeShortage = Math.max(0, expected);
    const remaining = Math.max(0, (await require('../../models/ReliefNeed').findOne({ camp: donation.camp, itemName: donation.itemName }))?.projectedShortage || 0);
    res.json({
      success: true,
      donation: populated,
      delivery,
      discrepancy,
      impact: {
        received,
        remainingShortage: remaining,
        shortageReducedBy: beforeShortage ? Math.round((received / Math.max(beforeShortage, received)) * 1000) / 10 : 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function listDeliveries(req, res, next) {
  try {
    const filter = {};
    if (req.query.campId) filter.camp = req.query.campId;
    const deliveries = await DonationDelivery.find(filter).populate('donation', 'donationId itemName quantity').populate('camp', 'name campId').sort({ createdAt: -1 });
    res.json({ success: true, deliveries });
  } catch (error) {
    next(error);
  }
}

module.exports = { createPledge, listDonations, updateStatus, verifyReceipt, listDeliveries };
