const Donation = require('../../models/Donation');
const CampInventory = require('../../models/CampInventory');
const { generateDonationId, generateSupplyDonationId } = require('../../utils/generateId');
const DonationAllocation = require('../../models/DonationAllocation');
const ImpactRecord = require('../../models/ImpactRecord');
const {
  addEvent,
  notifyDonor,
  recommendNeeds,
  verifyPayment,
  allocateDonation,
  recordImpact,
} = require('../../services/impactService');
const { DONATION_STATUS, DONATION_TRANSITIONS } = require('../../utils/constants');
const { syncReliefNeeds } = require('../../services/campService');
const DonationDelivery = require('../../models/DonationDelivery');
const { applyInventoryChange } = require('../../services/inventoryTransactionService');
const { writeAudit } = require('../../services/auditService');
const { createNotification } = require('../../services/notificationService');
const { required } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');
const VictimApplication = require('../../models/VictimApplication');
const { VICTIM_STATUS } = require('../../models/VictimApplication');
const ReliefCamp = require('../../models/ReliefCamp');
const { INVENTORY_ITEMS } = require('../../utils/constants');
const khalti = require('../../services/khaltiService');

async function createPledge(req, res, next) {
  try {
    const missing = required(['camp', 'itemName', 'quantity'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);

    const { metrics } = require('../../services/reliefEngine');
    const item = await CampInventory.findOne({ camp: req.body.camp, itemName: req.body.itemName });
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
    }

    const donation = await Donation.create({
      donationId: await generateSupplyDonationId(),
      kind: 'Physical',
      donorName: req.body.donorName || req.user.fullName,
      donorEmail: req.body.donorEmail || req.user.email || '',
      donorPhone: req.body.donorPhone || '',
      donorUser: req.user._id,
      camp: req.body.camp,
      itemName: req.body.itemName,
      quantity,
      pledgedQuantity: quantity,
      status: DONATION_STATUS.PLEDGED,
      timeline: [{ key: 'pledged', label: 'Donation Submitted', at: new Date(), description: 'Physical donation pledged.', byName: req.user.fullName }],
      donorType: req.body.donorType || 'Individual',
      reliefRequest: req.body.reliefRequest || undefined,
      notes: req.body.notes || '',
    });

    if (item) {
      item.incoming += quantity;
      await item.save();
      await syncReliefNeeds(donation.camp);
    }

    const populated = await Donation.findById(donation._id).populate('camp', 'name campId district');
    await notifyDonor(populated, {
      type: 'donation_created',
      title: 'Thank you for supporting RAHAT',
      body: `Your supply donation ${populated.donationId} has been recorded. We will notify you as it is accepted and used.`,
    });
    res.status(201).json({ success: true, donation: populated, warning });
  } catch (error) {
    next(error);
  }
}

async function listDonations(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.kind) filter.kind = req.query.kind;
    if (req.query.campId) filter.camp = req.query.campId;
    if (req.query.mine === 'true' && req.user) filter.donorUser = req.user._id;
    if (req.query.pendingVerification === 'true') {
      filter.status = { $in: [DONATION_STATUS.PENDING, DONATION_STATUS.PLEDGED] };
    }
    if (req.query.includeDemo !== 'true' && req.user?.role !== 'admin') {
      filter.isDemo = { $ne: true };
    }
    const donations = await Donation.find(filter).populate('camp', 'name campId district').populate('reliefNeed', 'itemName priority projectedShortage').sort({ createdAt: -1 });
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

    if (
      donation.paymentProvider === 'khalti'
      && nextStatus === DONATION_STATUS.PAYMENT_VERIFIED
      && donation.paymentStatus !== 'COMPLETE'
    ) {
      throw new AppError('Khalti payments can only be marked verified after Khalti confirms the transaction.', 409);
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

async function createMoneyDonation(req, res, next) {
  try {
    const amountNPR = Number(req.body.amountNPR);
    if (!amountNPR || amountNPR < 1) throw new AppError('Enter a donation amount of at least NPR 1', 400);
    const donation = await Donation.create({
      donationId: await generateDonationId(),
      kind: 'Money',
      donorName: req.body.donorName || req.user.fullName,
      donorEmail: req.body.donorEmail || req.user.email || '',
      donorPhone: req.body.donorPhone || '',
      donorUser: req.user._id,
      donorType: req.body.donorType || 'Individual',
      amountNPR,
      remainingAmount: amountNPR,
      purpose: req.body.purpose || '',
      message: req.body.message || '',
      category: req.body.category || 'Highest Priority Need',
      camp: req.body.camp || undefined,
      itemName: req.body.itemName || '',
      status: DONATION_STATUS.PENDING,
      notes: req.body.notes || 'DEMO PAYMENT FLOW — QR is a placeholder and does not confirm a bank transfer.',
      timeline: [{
        key: 'submitted',
        label: 'Donation Submitted',
        at: new Date(),
        description: `NPR ${amountNPR} recorded. Payment is pending administrator verification.`,
        byName: req.user.fullName,
      }],
    });
    await notifyDonor(donation, {
      type: 'donation_created',
      title: 'Thank you for supporting RAHAT',
      body: `Your contribution of NPR ${amountNPR} has been recorded. Donation ID: ${donation.donationId}. We will notify you when it is allocated and used for relief.`,
    });
    await writeAudit({ user: req.user, action: 'Donation created', entityType: 'Donation', entityId: donation.donationId });
    res.status(201).json({ success: true, donation, demo: true, message: 'Donation recorded as payment pending verification. This is a demo QR flow.' });
  } catch (error) {
    next(error);
  }
}

async function donationDetails(req, res, next) {
  try {
    const mongoose = require('mongoose');
    const filter = mongoose.Types.ObjectId.isValid(req.params.id)
      ? { $or: [{ _id: req.params.id }, { donationId: req.params.id }] }
      : { donationId: req.params.id };
    const donation = await Donation.findOne(filter).populate('camp', 'name campId district location').populate('reliefNeed', 'itemName priority unit projectedShortage').populate('donorUser', 'fullName email');
    if (!donation) throw new AppError('Donation not found', 404);
    const privileged = ['admin', 'camp_official', 'local_authority'];
    if (!privileged.includes(req.user.role) && String(donation.donorUser?._id || donation.donorUser) !== String(req.user._id)) {
      throw new AppError('You do not have permission to view this donation', 403);
    }
    const [allocations, impact] = await Promise.all([
      DonationAllocation.find({ donation: donation._id }).populate('need', 'itemName priority').populate('camp', 'name'),
      ImpactRecord.find({ donation: donation._id }).populate('verifiedBy', 'fullName'),
    ]);
    res.json({ success: true, donation, allocations, impact });
  } catch (error) {
    next(error);
  }
}

async function createPhysicalDonation(req, res, next) {
  try {
    const missing = required(['itemName', 'quantity'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    const quantity = Number(req.body.quantity);
    if (!quantity || quantity < 1) throw new AppError('Quantity must be at least 1', 400);
    if (req.body.camp) {
      req.body.donorName = req.body.donorName || req.user.fullName;
      return createPledge(req, res, next);
    }
    const donation = await Donation.create({
      donationId: await generateSupplyDonationId(),
      kind: 'Physical',
      donorName: req.body.donorName || req.user.fullName,
      donorEmail: req.body.donorEmail || req.user.email || '',
      donorPhone: req.body.donorPhone || '',
      donorUser: req.user._id,
      donorType: req.body.donorType || 'Individual',
      itemName: req.body.itemName,
      quantity,
      pledgedQuantity: quantity,
      unit: req.body.unit || '',
      condition: req.body.condition || 'New',
      availableDate: req.body.availableDate || undefined,
      deliveryMethod: req.body.deliveryMethod || '',
      message: req.body.message || '',
      status: DONATION_STATUS.PLEDGED,
      notes: req.body.notes || '',
      timeline: [{
        key: 'pledged',
        label: 'Donation Submitted',
        at: new Date(),
        description: `${quantity} ${req.body.unit || 'units'} of ${req.body.itemName} pledged.`,
        byName: req.user.fullName,
      }],
    });
    await notifyDonor(donation, {
      type: 'donation_created',
      title: 'Thank you for supporting RAHAT',
      body: `Your supply donation ${donation.donationId} has been recorded. We will notify you when it is accepted and used.`,
    });
    await writeAudit({ user: req.user, action: 'Donation created', entityType: 'Donation', entityId: donation.donationId });
    res.status(201).json({ success: true, donation });
  } catch (error) {
    next(error);
  }
}

async function recommend(req, res, next) {
  try {
    const result = await recommendNeeds({
      amountNPR: req.query.amountNPR || req.body?.amountNPR,
      itemName: req.query.itemName || req.body?.itemName,
      quantity: req.query.quantity || req.body?.quantity,
    });
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function verifyMoney(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    const updated = await verifyPayment(donation, req.user);
    res.json({ success: true, donation: updated });
  } catch (error) {
    next(error);
  }
}

async function allocate(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    const result = await allocateDonation(donation, req.body, req.user);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function completeImpact(req, res, next) {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) throw new AppError('Donation not found', 404);
    const impact = await recordImpact(donation, req.body, req.user);
    const fresh = await Donation.findById(donation._id).populate('camp', 'name');
    res.json({ success: true, donation: fresh, impact });
  } catch (error) {
    next(error);
  }
}

async function initiateKhalti(req, res, next) {
  try {
    const amountNPR = Number(req.body.amountNPR);
    if (!Number.isFinite(amountNPR) || amountNPR < 10) throw new AppError('Enter a valid amount of at least NPR 10.00', 400);

    let victim = null;
    let purpose = req.body.purpose || 'Highest Priority Need';
    if (req.body.victimId) {
      victim = await VictimApplication.findById(req.body.victimId);
      if (!victim || !victim.isPublic || ![VICTIM_STATUS.APPROVED, VICTIM_STATUS.FULFILLED].includes(victim.status)) {
        throw new AppError('This person is not available for donations.', 404);
      }
      const remaining = Math.max(0, victim.amountNeededNPR - (victim.amountRaisedNPR || 0));
      if (remaining <= 0) throw new AppError('This request is already fully funded.', 409);
      if (amountNPR > remaining) throw new AppError(`Only NPR ${remaining.toFixed(2)} is still needed.`, 409);
      purpose = `Support for ${victim.displayName}`;
    }

    let camp = null;
    if (req.body.camp) {
      camp = await ReliefCamp.findById(req.body.camp).select('name campId district');
      if (!camp) throw new AppError('The selected camp was not found.', 404);
    }

    const itemName = INVENTORY_ITEMS.includes(req.body.itemName) ? req.body.itemName : '';
    const amount = Number(khalti.money(amountNPR));
    const donation = await Donation.create({
      donationId: await generateDonationId(),
      kind: 'Money',
      donorName: req.body.donorName || req.user?.fullName || 'Khalti donor',
      donorEmail: req.body.donorEmail || req.user?.email || '',
      donorPhone: req.body.donorPhone || '',
      donorUser: req.user?._id,
      donorType: req.body.donorType || 'Individual',
      amountNPR: amount,
      remainingAmount: amount,
      purpose,
      message: req.body.message || '',
      category: req.body.category || purpose,
      camp: camp?._id,
      itemName,
      victim: victim?._id,
      paymentProvider: 'khalti',
      paymentStatus: 'INITIATED',
      status: DONATION_STATUS.PENDING,
      timeline: [{
        key: 'khalti_started',
        label: 'Khalti checkout started',
        at: new Date(),
        description: victim ? `NPR ${khalti.money(amount)} toward ${victim.applicationId}` : `NPR ${khalti.money(amount)} via Khalti`,
        byName: req.user?.fullName || 'Donor',
      }],
    });

    const checkout = await khalti.initiatePayment({
      amountNPR: amount,
      purchaseOrderId: donation.donationId,
      purchaseOrderName: purpose,
      donorName: donation.donorName,
      donorEmail: donation.donorEmail,
      donorPhone: donation.donorPhone,
    });

    donation.khaltiPidx = checkout.pidx;
    donation.purchaseOrderId = donation.donationId;
    await donation.save();

    console.log(`Khalti payment initiated ${donation.donationId} pidx=${checkout.pidx} amount=${khalti.money(amount)}`);
    res.json({
      success: true,
      donationId: donation.donationId,
      payment: {
        paymentUrl: checkout.paymentUrl,
        pidx: checkout.pidx,
        environment: checkout.environment,
        sandboxFallback: checkout.sandboxFallback,
      },
    });
  } catch (error) {
    next(error);
  }
}

function publicDonation(donation) {
  if (!donation) return null;
  const row = donation.toObject ? donation.toObject() : donation;
  return {
    donationId: row.donationId,
    amountNPR: row.amountNPR,
    purpose: row.purpose,
    status: row.status,
    paymentStatus: row.paymentStatus,
    paymentProvider: row.paymentProvider,
    khaltiPidx: row.khaltiPidx,
    khaltiTxnId: row.khaltiTxnId,
    purchaseOrderId: row.purchaseOrderId || row.donationId,
    itemName: row.itemName || '',
    category: row.category || '',
    campName: row.camp?.name || '',
    campDistrict: row.camp?.district || '',
    victimName: row.victim?.displayName || '',
    victimId: row.victim?.applicationId || '',
  };
}

function isAlreadyComplete(donation) {
  return donation.paymentStatus === 'COMPLETE'
    || donation.status === DONATION_STATUS.PAYMENT_VERIFIED
    || donation.status === DONATION_STATUS.COMPLETED;
}

function paymentIdFrom(req) {
  return String(req.query.pidx || req.body?.pidx || req.query.purchase_order_id || req.body?.purchase_order_id || '').trim();
}

async function findPaymentDonation({ pidx, purchaseOrderId }) {
  const filter = [];
  if (pidx) filter.push({ khaltiPidx: pidx });
  if (purchaseOrderId) filter.push({ donationId: purchaseOrderId }, { purchaseOrderId });
  if (!filter.length) return null;
  return Donation.findOne({ $or: filter }).populate('victim').populate('camp', 'name campId district');
}

async function setPaymentOutcome(donation, paymentStatus, description) {
  if (isAlreadyComplete(donation)) return donation;
  donation.paymentStatus = paymentStatus;
  if (paymentStatus === 'CANCELED') donation.status = DONATION_STATUS.CANCELLED;
  addEvent(donation, `khalti_${paymentStatus.toLowerCase()}`, `Khalti ${paymentStatus}`, description || `Payment state ${paymentStatus}.`, donation.donorName);
  await donation.save();
  return donation;
}

async function applyKhaltiLookup({ pidx, purchaseOrderId, callbackAmountPaisa }) {
  const donation = await findPaymentDonation({ pidx, purchaseOrderId });
  if (!donation) throw new AppError('No matching donation was found for this payment.', 404);
  if (isAlreadyComplete(donation)) {
    return { alreadyVerified: true, outcome: 'COMPLETE', donation };
  }

  const remote = await khalti.lookupPayment(donation.khaltiPidx || pidx);
  console.log(`Khalti verify ${donation.donationId} pidx=${donation.khaltiPidx} remote=${remote.status}`);

  if (remote.status === 'COMPLETE') {
    const expectedPaisa = khalti.toPaisa(donation.amountNPR);
    if (remote.amountPaisa && Math.abs(remote.amountPaisa - expectedPaisa) > 1) {
      await setPaymentOutcome(donation, 'FAILED', 'Khalti amount did not match the stored donation amount.');
      return { alreadyVerified: false, outcome: 'FAILED', donation, reason: 'amount' };
    }
    if (callbackAmountPaisa && Math.abs(Number(callbackAmountPaisa) - expectedPaisa) > 1) {
      await setPaymentOutcome(donation, 'FAILED', 'Callback amount did not match the stored donation amount.');
      return { alreadyVerified: false, outcome: 'FAILED', donation, reason: 'amount' };
    }
    const verified = await markKhaltiVerified(donation, remote.txnId);
    return { alreadyVerified: false, outcome: 'COMPLETE', donation: verified, statusCheck: { status: remote.status } };
  }

  if (['CANCELED', 'NOT_FOUND', 'FAILED', 'FULL_REFUND', 'PARTIAL_REFUND'].includes(remote.status)) {
    await setPaymentOutcome(donation, remote.status, `Khalti status ${remote.raw || remote.status}.`);
    return { alreadyVerified: false, outcome: remote.status, donation, statusCheck: { status: remote.status } };
  }

  const pendingStatus = remote.status === 'UNAVAILABLE' ? 'UNAVAILABLE' : (remote.status === 'PENDING' ? 'PENDING' : 'AMBIGUOUS');
  await setPaymentOutcome(donation, pendingStatus, `Khalti status is ${remote.raw || remote.status}. Payment is not marked complete until Khalti confirms it.`);
  return { alreadyVerified: false, outcome: pendingStatus, donation, statusCheck: { status: remote.status } };
}

async function verifyKhalti(req, res, next) {
  try {
    const pidx = String(req.body.pidx || req.query.pidx || '').trim();
    const purchaseOrderId = String(req.body.purchase_order_id || req.query.purchase_order_id || '').trim();
    if (!pidx && !purchaseOrderId) throw new AppError('Missing Khalti payment id.', 400);
    const result = await applyKhaltiLookup({
      pidx,
      purchaseOrderId,
      callbackAmountPaisa: req.body.amount || req.query.amount,
    });
    res.json({
      success: result.outcome === 'COMPLETE',
      outcome: result.outcome,
      alreadyVerified: result.alreadyVerified,
      donation: publicDonation(result.donation),
      statusCheck: result.statusCheck,
    });
  } catch (error) {
    next(error);
  }
}

async function checkKhaltiStatus(req, res, next) {
  try {
    const pidx = paymentIdFrom(req);
    if (!pidx) throw new AppError('Missing payment id.', 400);
    const result = await applyKhaltiLookup({
      pidx,
      purchaseOrderId: String(req.query.purchase_order_id || req.body?.purchase_order_id || '').trim(),
    });
    res.json({
      success: result.outcome === 'COMPLETE',
      outcome: result.outcome,
      alreadyVerified: result.alreadyVerified,
      donation: publicDonation(result.donation),
    });
  } catch (error) {
    next(error);
  }
}

async function confirmSandboxKhalti(req, res, next) {
  try {
    if (!khalti.sandboxFallbackEnabled()) {
      throw new AppError('Sandbox confirmation is only available in Khalti test mode.', 403);
    }
    const pidx = String(req.body.pidx || req.query.pidx || '').trim();
    const purchaseOrderId = String(req.body.purchase_order_id || req.query.purchase_order_id || '').trim();
    if (!pidx && !purchaseOrderId) throw new AppError('Missing payment id.', 400);

    const donation = await findPaymentDonation({ pidx, purchaseOrderId });
    if (!donation) throw new AppError('No matching donation was found for this payment.', 404);
    if (isAlreadyComplete(donation)) {
      return res.json({
        success: true,
        outcome: 'COMPLETE',
        alreadyVerified: true,
        sandbox: true,
        donation: publicDonation(donation),
      });
    }

    const remote = await khalti.lookupPayment(donation.khaltiPidx || pidx);
    if (remote.status === 'COMPLETE') {
      const verified = await markKhaltiVerified(donation, remote.txnId);
      return res.json({
        success: true,
        outcome: 'COMPLETE',
        alreadyVerified: false,
        donation: publicDonation(verified),
      });
    }

    const verified = await markKhaltiVerified(donation, `SANDBOX-${donation.donationId}`, { sandbox: true });
    console.log(`Khalti sandbox confirmation ${donation.donationId} pidx=${donation.khaltiPidx}`);
    res.json({
      success: true,
      outcome: 'COMPLETE',
      alreadyVerified: false,
      sandbox: true,
      donation: publicDonation(verified),
    });
  } catch (error) {
    next(error);
  }
}

async function markKhaltiVerified(donation, transactionId, options = {}) {
  const claimed = await Donation.findOneAndUpdate(
    {
      _id: donation._id,
      paymentStatus: { $ne: 'COMPLETE' },
      status: { $nin: [DONATION_STATUS.PAYMENT_VERIFIED, DONATION_STATUS.COMPLETED] },
    },
    {
      $set: {
        paymentStatus: 'COMPLETE',
        status: DONATION_STATUS.PAYMENT_VERIFIED,
        khaltiTxnId: transactionId || donation.khaltiTxnId || '',
      },
    },
    { new: true }
  ).populate('victim').populate('camp', 'name campId district');

  if (!claimed) {
    return Donation.findById(donation._id).populate('victim').populate('camp', 'name campId district');
  }

  addEvent(
    claimed,
    options.sandbox ? 'khalti_sandbox' : 'khalti_verified',
    options.sandbox ? 'Khalti sandbox donation confirmed' : 'Khalti payment verified',
    options.sandbox
      ? `Khalti test wallet was unavailable (MPIN locked). RAHAT recorded sandbox donation ${claimed.donationId}. Not a live Khalti charge.`
      : `Reference ${transactionId || claimed.khaltiPidx}. Payment confirmed. Relief inventory is not marked received.`,
    claimed.donorName
  );
  await claimed.save();

  if (claimed.victim) {
    const victim = await VictimApplication.findById(claimed.victim._id || claimed.victim);
    victim.amountRaisedNPR = (victim.amountRaisedNPR || 0) + claimed.amountNPR;
    if (victim.amountRaisedNPR >= victim.amountNeededNPR) {
      victim.status = VICTIM_STATUS.FULFILLED;
    }
    await victim.save();
  }

  await notifyDonor(claimed, {
    type: 'donation_created',
    title: 'Khalti payment received',
    body: `Thank you. NPR ${Number(claimed.amountNPR).toFixed(2)} was recorded for ${claimed.purpose}.`,
  });
  return claimed;
}

module.exports = {
  createPledge,
  createMoneyDonation,
  createPhysicalDonation,
  listDonations,
  donationDetails,
  recommend,
  verifyMoney,
  allocate,
  completeImpact,
  updateStatus,
  verifyReceipt,
  listDeliveries,
  initiateKhalti,
  verifyKhalti,
  checkKhaltiStatus,
  confirmSandboxKhalti,
};
