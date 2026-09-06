const Shipment = require('../../models/Shipment');
const Donation = require('../../models/Donation');
const CampInventory = require('../../models/CampInventory');
const Distribution = require('../../models/Distribution');
const { generateShipmentId } = require('../../utils/generateId');
const { SHIPMENT_STATUS, DONATION_STATUS } = require('../../utils/constants');
const { syncReliefNeeds } = require('../../services/reliefEngine');
const { writeAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorMiddleware');

async function create(req, res, next) {
  try {
    const { donationId, camp, itemName, quantity } = req.body;
    let donation = null;
    if (donationId) donation = await Donation.findById(donationId);
    const shipment = await Shipment.create({
      shipmentId: await generateShipmentId(),
      donation: donation?._id,
      camp: camp || donation?.camp,
      itemName: itemName || donation?.itemName,
      quantity: quantity || donation?.quantity,
      dispatchedQuantity: quantity || donation?.quantity || 0,
      origin: req.body.origin || '',
      destination: req.body.destination || '',
      transportType: req.body.transportType || '',
      carrier: req.body.carrier || '',
      expectedArrival: req.body.expectedArrival,
      status: SHIPMENT_STATUS.PREPARED,
      createdBy: req.user._id,
      notes: req.body.notes || '',
    });
    if (donation) {
      donation.status = DONATION_STATUS.ALLOCATED;
      await donation.save();
    }
    res.status(201).json({ success: true, shipment });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.campId) filter.camp = req.query.campId;
    const shipments = await Shipment.find(filter).populate('camp', 'name campId').populate('donation', 'donationId donorName').sort({ createdAt: -1 });
    res.json({ success: true, shipments });
  } catch (error) {
    next(error);
  }
}

async function dispatch(req, res, next) {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Shipment not found', 404);
    shipment.status = SHIPMENT_STATUS.IN_TRANSIT;
    shipment.dispatchDate = new Date();
    await shipment.save();
    if (shipment.donation) {
      await Donation.findByIdAndUpdate(shipment.donation, { status: DONATION_STATUS.IN_TRANSIT });
    }
    await writeAudit({
      user: req.user,
      action: 'Shipment dispatched',
      entityType: 'Shipment',
      entityId: shipment.shipmentId,
      metadata: { quantity: shipment.quantity },
      ip: req.ip,
    });
    res.json({ success: true, shipment });
  } catch (error) {
    next(error);
  }
}

async function receive(req, res, next) {
  try {
    const shipment = await Shipment.findById(req.params.id);
    if (!shipment) throw new AppError('Shipment not found', 404);
    const received = Number(req.body.receivedQuantity ?? shipment.quantity);
    const damaged = Number(req.body.damagedQuantity || 0);
    const missing = Number(req.body.missingQuantity || 0);
    const usable = Math.max(0, received - damaged);
    shipment.receivedQuantity = received;
    shipment.damagedQuantity = damaged;
    shipment.missingQuantity = missing;
    shipment.actualArrival = new Date();
    shipment.status = usable < shipment.quantity ? SHIPMENT_STATUS.PARTIALLY_RECEIVED : SHIPMENT_STATUS.RECEIVED;
    await shipment.save();

    const item = await CampInventory.findOne({ camp: shipment.camp, itemName: shipment.itemName });
    if (item) {
      item.current = Math.max(0, item.current + usable);
      item.incoming = Math.max(0, item.incoming - shipment.quantity);
      await item.save();
      await syncReliefNeeds(shipment.camp);
    }

    if (shipment.donation) {
      const donation = await Donation.findById(shipment.donation);
      if (donation) {
        donation.receivedQuantity = usable;
        donation.status = shipment.status === SHIPMENT_STATUS.PARTIALLY_RECEIVED
          ? DONATION_STATUS.PARTIALLY_RECEIVED
          : DONATION_STATUS.RECEIVED;
        donation.receivedAt = new Date();
        donation.inventoryUpdated = true;
        await donation.save();
      }
    }

    await writeAudit({
      user: req.user,
      action: 'Shipment received',
      entityType: 'Shipment',
      entityId: shipment.shipmentId,
      metadata: { usable, damaged, missing },
      ip: req.ip,
    });
    res.json({ success: true, shipment, usableReceived: usable });
  } catch (error) {
    next(error);
  }
}

async function distribute(req, res, next) {
  try {
    const { campId, itemName, quantity } = req.body;
    if (!campId || !itemName || !quantity) throw new AppError('Camp, item and quantity are required', 400);
    const item = await CampInventory.findOne({ camp: campId, itemName });
    if (!item) throw new AppError('Inventory item not found', 404);
    if (item.current < Number(quantity)) throw new AppError('Inventory cannot become negative', 400);
    item.current -= Number(quantity);
    item.distributed += Number(quantity);
    await item.save();
    await syncReliefNeeds(campId);
    const record = await Distribution.create({
      camp: campId,
      shipment: req.body.shipmentId,
      donation: req.body.donationId,
      itemName,
      quantity: Number(quantity),
      recipientGroup: req.body.recipientGroup || '',
      householdCount: req.body.householdCount || 0,
      personCount: req.body.personCount || 0,
      official: req.user._id,
      notes: req.body.notes || '',
    });
    res.status(201).json({ success: true, distribution: record, inventory: item });
  } catch (error) {
    next(error);
  }
}

async function listDistributions(req, res, next) {
  try {
    const filter = {};
    if (req.query.campId) filter.camp = req.query.campId;
    const rows = await Distribution.find(filter).populate('camp', 'name campId').sort({ createdAt: -1 }).limit(80);
    res.json({ success: true, distributions: rows });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, dispatch, receive, distribute, listDistributions };
