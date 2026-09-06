const SafeZone = require('../../models/SafeZone');
const SafeZoneCheckIn = require('../../models/SafeZoneCheckIn');
const Disaster = require('../../models/Disaster');
const {
  createSafeZone,
  declareSafeZone,
  checkIn,
  transferToCamp,
  haversineKm,
} = require('../../services/safeZoneService');
const { SAFE_ZONE_STATUS } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function list(req, res, next) {
  try {
    const filter = {};
    if (req.query.public === 'true') {
      filter.isPublic = true;
      filter.status = { $in: [SAFE_ZONE_STATUS.ACTIVE, SAFE_ZONE_STATUS.DECLARED_SAFE, SAFE_ZONE_STATUS.FULL] };
    }
    if (req.query.ward) filter.ward = req.query.ward;
    if (req.query.municipality) filter.municipality = { $regex: req.query.municipality, $options: 'i' };
    if (req.query.type) filter.suitableDisasterTypes = req.query.type;
    if (req.query.status) filter.status = req.query.status;
    const zones = await SafeZone.find(filter).populate('disaster', 'name type disasterLevel status').sort({ name: 1 });
    const lat = req.query.lat ? Number(req.query.lat) : null;
    const lng = req.query.lng ? Number(req.query.lng) : null;
    const mapped = zones.map((zone) => {
      const json = zone.toJSON();
      json.distanceKm = lat != null && lng != null ? haversineKm(lat, lng, zone.latitude, zone.longitude) : null;
      return json;
    });
    if (mapped.some((z) => z.distanceKm != null)) {
      mapped.sort((a, b) => (a.distanceKm ?? 999) - (b.distanceKm ?? 999));
    }
    res.json({ success: true, safeZones: mapped });
  } catch (error) {
    next(error);
  }
}

async function details(req, res, next) {
  try {
    const zone = await SafeZone.findById(req.params.id).populate('disaster').populate('declaredBy', 'fullName role');
    if (!zone) throw new AppError('Safe zone not found', 404);
    const checkIns = await SafeZoneCheckIn.find({ safeZone: zone._id, status: 'Present' })
      .populate('citizen', 'fullName registrationId disasterStatus isVulnerable')
      .populate('unregisteredPerson', 'name temporaryId')
      .sort({ checkedInAt: -1 });
    res.json({ success: true, safeZone: zone, checkIns });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.name) throw new AppError('Safe zone name is required', 400);
    const zone = await createSafeZone(req.body, req.user, req.ip);
    res.status(201).json({ success: true, safeZone: zone });
  } catch (error) {
    next(error);
  }
}

async function declare(req, res, next) {
  try {
    const zone = await declareSafeZone(req.params.id, req.body, req.user, req.ip);
    res.json({ success: true, safeZone: zone });
  } catch (error) {
    next(error);
  }
}

async function doCheckIn(req, res, next) {
  try {
    const result = await checkIn({
      citizenId: req.body.citizenId,
      unregisteredId: req.body.unregisteredId,
      householdId: req.body.householdId,
      safeZoneId: req.body.safeZoneId || req.params.id,
      familyMembersCount: req.body.familyMembersCount,
      specialNeeds: req.body.specialNeeds,
      currentCondition: req.body.currentCondition,
      notes: req.body.notes,
      official: req.user,
      ip: req.ip,
    });
    res.status(201).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

async function transfer(req, res, next) {
  try {
    const transferDoc = await transferToCamp({
      citizenId: req.body.citizenId,
      unregisteredId: req.body.unregisteredId,
      fromSafeZoneId: req.body.fromSafeZoneId,
      toCampId: req.body.toCampId,
      reason: req.body.reason,
      transport: req.body.transport,
      notes: req.body.notes,
      official: req.user,
      ip: req.ip,
      overrideCapacity: req.user.role === 'admin' && req.body.overrideCapacity,
    });
    res.status(201).json({ success: true, transfer: transferDoc });
  } catch (error) {
    next(error);
  }
}

async function mapData(req, res, next) {
  try {
    const [zones, disasters, camps] = await Promise.all([
      SafeZone.find({ isPublic: true }).populate('disaster', 'name type disasterLevel'),
      Disaster.find({ status: 'Active', isPublic: true }),
      require('../../models/ReliefCamp').find({ isActive: true }),
    ]);
    res.json({ success: true, safeZones: zones, disasters, camps });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, details, create, declare, doCheckIn, transfer, mapData };
