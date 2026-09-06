const ReliefRequest = require('../../models/ReliefRequest');
const ReliefNeed = require('../../models/ReliefNeed');
const CampInventory = require('../../models/CampInventory');
const ReliefCamp = require('../../models/ReliefCamp');
const ReliefAllocation = require('../../models/ReliefAllocation');
const Donation = require('../../models/Donation');
const { generateRequestId, generateAllocationId } = require('../../utils/generateId');
const { evaluateItem, syncReliefNeeds, decorateInventory, metrics } = require('../../services/reliefEngine');
const { assertOfficialCampAccess } = require('../../services/campService');
const { writeAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorMiddleware');

async function listNeeds(req, res, next) {
  try {
    const filter = { isPublished: true };
    if (req.query.campId) filter.camp = req.query.campId;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.itemName) filter.itemName = req.query.itemName;
    const needs = await ReliefNeed.find(filter).populate('camp', 'name campId district currentPopulation isDemo');
    const includeDemo = req.query.includeDemo === 'true' || req.user?.role === 'admin';
    const visible = includeDemo ? needs : needs.filter((need) => need.camp && !need.camp.isDemo);
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    visible.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9) || (b.projectedShortage || b.shortage) - (a.projectedShortage || a.shortage));
    res.json({ success: true, needs: visible });
  } catch (error) {
    next(error);
  }
}

async function matchNeeds(req, res, next) {
  try {
    const itemName = req.query.itemName || req.body.itemName;
    const quantity = Number(req.query.quantity || req.body.quantity || 0);
    if (!itemName) throw new AppError('Item name is required', 400);
    const needs = await ReliefNeed.find({ itemName, isPublished: true, projectedShortage: { $gt: 0 } })
      .populate('camp', 'name campId district currentPopulation');
    const matches = needs.map((need) => {
      const shortage = need.projectedShortage || need.shortage || 0;
      const coverage = shortage ? Math.min(100, Math.round((quantity / shortage) * 100)) : 0;
      return {
        ...need.toJSON(),
        coverage,
        warning: quantity && shortage && quantity > shortage
          ? 'This contribution exceeds the verified shortage. An administrator can allow excess allocation.'
          : null,
      };
    }).sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return (order[a.priority] ?? 9) - (order[b.priority] ?? 9);
    });
    res.json({ success: true, matches });
  } catch (error) {
    next(error);
  }
}

async function createRequest(req, res, next) {
  try {
    const campId = req.body.campId || req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
    if (!campId || !req.body.itemName) throw new AppError('Camp and item are required', 400);
    if (req.user.role === 'camp_official') assertOfficialCampAccess(req.user, campId);
    const item = await CampInventory.findOne({ camp: campId, itemName: req.body.itemName });
    if (req.body.required !== undefined && item) item.required = Number(req.body.required);
    if (req.body.dailyConsumption !== undefined && item) item.dailyConsumption = Number(req.body.dailyConsumption);
    if (item) await item.save();
    if (item) await syncReliefNeeds(campId);
    const camp = await ReliefCamp.findById(campId);
    const evaluated = item ? await evaluateItem(item, camp) : {};
    const request = await ReliefRequest.create({
      requestId: await generateRequestId(),
      camp: campId,
      disaster: camp?.disaster,
      itemName: req.body.itemName,
      current: item?.current || 0,
      required: item?.required || req.body.required || 0,
      incoming: item?.incoming || 0,
      dailyConsumption: item?.dailyConsumption || req.body.dailyConsumption || 0,
      unit: item?.unit || req.body.unit || 'units',
      notes: req.body.notes || '',
      status: 'Submitted',
      priority: evaluated.priority || 'HIGH',
      priorityReason: evaluated.priorityReason || '',
      submittedBy: req.user._id,
    });
    res.status(201).json({ success: true, request, evaluation: evaluated });
  } catch (error) {
    next(error);
  }
}

async function listRequests(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'camp_official') {
      filter.camp = req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
    }
    if (req.query.status) filter.status = req.query.status;
    const requests = await ReliefRequest.find(filter).populate('camp', 'name campId').sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (error) {
    next(error);
  }
}

async function verifyRequest(req, res, next) {
  try {
    const request = await ReliefRequest.findById(req.params.id);
    if (!request) throw new AppError('Relief request not found', 404);
    request.status = 'Verified';
    request.verifiedBy = req.user._id;
    request.verifiedAt = new Date();
    await request.save();
    await writeAudit({
      user: req.user,
      action: 'Relief request approved',
      entityType: 'ReliefRequest',
      entityId: request.requestId,
      metadata: { itemName: request.itemName },
      ip: req.ip,
    });
    res.json({ success: true, request });
  } catch (error) {
    next(error);
  }
}

async function recommendAllocation(req, res, next) {
  try {
    const { itemName, availableQuantity } = req.body;
    const qty = Number(availableQuantity);
    if (!itemName || !qty) throw new AppError('Item and available quantity are required', 400);
    const needs = await ReliefNeed.find({ itemName, isPublished: true }).populate('camp', 'name campId currentPopulation');
    const order = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const scored = needs
      .map((need) => ({ need, weight: (order[need.priority] || 1) * Math.max(1, need.projectedShortage || need.shortage || 1) }))
      .sort((a, b) => b.weight - a.weight);
    const totalWeight = scored.reduce((sum, row) => sum + row.weight, 0) || 1;
    let remaining = qty;
    const lines = scored.map((row, index) => {
      const share = index === scored.length - 1
        ? remaining
        : Math.min(row.need.projectedShortage || row.need.shortage || remaining, Math.round((row.weight / totalWeight) * qty));
      remaining = Math.max(0, remaining - share);
      return {
        camp: row.need.camp,
        quantity: share,
        reason: `${row.need.priority} need, shortage ${row.need.projectedShortage || row.need.shortage}`,
      };
    });
    const allocation = await ReliefAllocation.create({
      allocationId: await generateAllocationId(),
      itemName,
      availableQuantity: qty,
      lines,
      status: 'Recommended',
      createdBy: req.user._id,
    });
    res.json({ success: true, allocation });
  } catch (error) {
    next(error);
  }
}

async function confirmAllocation(req, res, next) {
  try {
    const allocation = await ReliefAllocation.findById(req.params.id);
    if (!allocation) throw new AppError('Allocation not found', 404);
    if (req.body.lines) allocation.lines = req.body.lines;
    allocation.status = 'Confirmed';
    allocation.confirmedBy = req.user._id;
    await allocation.save();
    await writeAudit({
      user: req.user,
      action: 'Allocation changed',
      entityType: 'ReliefAllocation',
      entityId: allocation.allocationId,
      metadata: { itemName: allocation.itemName },
      ip: req.ip,
    });
    res.json({ success: true, allocation });
  } catch (error) {
    next(error);
  }
}

async function listAllocations(req, res, next) {
  try {
    const allocations = await ReliefAllocation.find().populate('lines.camp', 'name campId').sort({ createdAt: -1 });
    res.json({ success: true, allocations });
  } catch (error) {
    next(error);
  }
}

async function supplyDemand(req, res, next) {
  try {
    const items = await CampInventory.find().populate('camp', 'name');
    const grouped = {};
    items.forEach((item) => {
      if (!grouped[item.itemName]) {
        grouped[item.itemName] = { itemName: item.itemName, required: 0, available: 0, incoming: 0, distributed: 0, remainingGap: 0, unit: item.unit };
      }
      const m = metrics(item);
      grouped[item.itemName].required += m.required;
      grouped[item.itemName].available += m.current;
      grouped[item.itemName].incoming += m.incoming;
      grouped[item.itemName].distributed += item.distributed || 0;
      grouped[item.itemName].remainingGap += m.projectedShortage;
    });
    res.json({ success: true, rows: Object.values(grouped) });
  } catch (error) {
    next(error);
  }
}

async function commandCenter(req, res, next) {
  try {
    const SafeZone = require('../../models/SafeZone');
    const Disaster = require('../../models/Disaster');
    const Citizen = require('../../models/Citizen');
    const Donation = require('../../models/Donation');
    const DonationDelivery = require('../../models/DonationDelivery');
    const ResourceTransfer = require('../../models/ResourceTransfer');
    const { PERSON_STATUS, DISASTER_STATUS, PRIORITY } = require('../../utils/constants');
    const disaster = await Disaster.findOne({ status: DISASTER_STATUS.ACTIVE }).sort({ updatedAt: -1 });
    const [
      safeZones,
      peopleInSafeZones,
      camps,
      campPopulation,
      criticalNeeds,
      donationsInTransit,
      receivedDonations,
      deliveryDiscrepancies,
      resourceTransfers,
      activeDisasters,
      zoneCapacity,
      needs,
    ] = await Promise.all([
      SafeZone.countDocuments({ status: { $in: ['Active', 'Available', 'Declared Safe', 'Full'] } }),
      Citizen.countDocuments({ disasterStatus: PERSON_STATUS.IN_SAFE_ZONE }),
      ReliefCamp.countDocuments({ isActive: true }),
      ReliefCamp.aggregate([{ $group: { _id: null, total: { $sum: '$currentPopulation' } } }]),
      ReliefNeed.countDocuments({ priority: PRIORITY.CRITICAL, isPublished: true }),
      Donation.countDocuments({ status: { $in: ['In Transit', 'Arrived'] } }),
      Donation.countDocuments({ status: { $in: ['Received', 'In Inventory', 'Distributed', 'Partially Received'] } }),
      DonationDelivery.countDocuments({ discrepancy: { $gt: 0 } }),
      ResourceTransfer.countDocuments(),
      Disaster.countDocuments({ status: DISASTER_STATUS.ACTIVE }),
      SafeZone.aggregate([{ $group: { _id: null, cap: { $sum: '$capacity' }, occ: { $sum: '$currentOccupancy' } } }]),
      ReliefNeed.find({ isPublished: true }).populate('camp', 'name campId'),
    ]);
    const requiredQty = needs.reduce((s, n) => s + (n.required || 0), 0);
    const shortage = needs.reduce((s, n) => s + (n.projectedShortage || n.shortage || 0), 0);
    const estimated = disaster?.expectedPopulation || disaster?.estimatedAffectedPopulation || 0;
    const capacity = zoneCapacity[0]?.cap || 0;
    res.json({
      success: true,
      disaster,
      stats: {
        activeDisasters,
        affectedPeople: estimated,
        affectedWards: disaster?.affectedWards?.length || 0,
        disasterLevel: disaster?.disasterLevel || 0,
        safeZones,
        safeZoneCapacity: capacity,
        safeZoneDeficit: Math.max(0, estimated - capacity),
        peopleInSafeZones,
        reliefCamps: camps,
        campPopulation: campPopulation[0]?.total || 0,
        criticalNeeds,
        donationsInTransit,
        receivedDonations,
        deliveryDiscrepancies,
        resourceTransfers,
        reliefInTransit: donationsInTransit,
        unfulfilledDemandPercent: requiredQty ? Math.round((shortage / requiredQty) * 100) : 0,
      },
      criticalNeedRows: needs.filter((n) => n.priority === PRIORITY.CRITICAL).slice(0, 8),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  listNeeds,
  matchNeeds,
  createRequest,
  listRequests,
  verifyRequest,
  recommendAllocation,
  confirmAllocation,
  listAllocations,
  supplyDemand,
  commandCenter,
  decorateInventory,
};
