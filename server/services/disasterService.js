const Disaster = require('../models/Disaster');
const { DISASTER_STATUS } = require('../utils/constants');
const { generateDisasterId } = require('../utils/generateId');
const { writeAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const { AppError } = require('../middleware/errorMiddleware');

async function listPublicDisasters() {
  return Disaster.find({ isPublic: true, isDemo: { $ne: true } }).populate('activeCamps', 'name campId district currentPopulation capacity').sort({ date: -1 });
}

async function getActiveDisasters() {
  return Disaster.find({ status: DISASTER_STATUS.ACTIVE, isPublic: true, isDemo: { $ne: true } }).populate('activeCamps', 'name campId district');
}

async function createDisaster(payload, admin, ip) {
  const disaster = await Disaster.create({
    disasterId: await generateDisasterId(),
    name: payload.name,
    type: payload.type,
    location: payload.location || '',
    district: payload.district || '',
    municipality: payload.municipality || '',
    ward: payload.ward || '',
    date: payload.date,
    severity: payload.severity || 'Moderate',
    description: payload.description || '',
    affectedAreas: payload.affectedAreas || payload.affectedWards || [],
    affectedWards: payload.affectedWards || payload.affectedAreas || [],
    expectedPopulation: payload.expectedPopulation || 0,
    evacuationRequired: payload.evacuationRequired !== false,
    disasterLevel: Number(payload.disasterLevel || 2),
    responsePriorities: payload.responsePriorities || [],
    localGovernment: payload.localGovernment || undefined,
    latitude: payload.latitude,
    longitude: payload.longitude,
    activeCamps: payload.activeCamps || [],
    status: payload.status || DISASTER_STATUS.ACTIVE,
    isPublic: payload.isPublic !== false,
  });

  await writeAudit({
    user: admin,
    action: payload.status === DISASTER_STATUS.ACTIVE ? 'Disaster activated' : 'Disaster created',
    entityType: 'Disaster',
    entityId: disaster.disasterId,
    metadata: { name: disaster.name, type: disaster.type, disasterLevel: disaster.disasterLevel },
    ip,
  });

  if (disaster.status === DISASTER_STATUS.ACTIVE) {
    await createNotification({
      audience: 'all',
      title: 'Disaster Active',
      body: `${disaster.name} has been activated. Use RAHAT to find family members and locate relief camps.`,
      type: 'disaster_activated',
      relatedModel: 'Disaster',
      relatedId: disaster._id,
    });
  }

  return disaster;
}

async function updateDisaster(id, payload, admin, ip) {
  const disaster = await Disaster.findById(id);
  if (!disaster) throw new AppError('Disaster not found', 404);

  const wasActive = disaster.status === DISASTER_STATUS.ACTIVE;
  Object.assign(disaster, {
    name: payload.name ?? disaster.name,
    type: payload.type ?? disaster.type,
    location: payload.location ?? disaster.location,
    district: payload.district ?? disaster.district,
    municipality: payload.municipality ?? disaster.municipality,
    ward: payload.ward ?? disaster.ward,
    date: payload.date ?? disaster.date,
    severity: payload.severity ?? disaster.severity,
    description: payload.description ?? disaster.description,
    affectedAreas: payload.affectedAreas ?? disaster.affectedAreas,
    affectedWards: payload.affectedWards ?? disaster.affectedWards,
    expectedPopulation: payload.expectedPopulation ?? disaster.expectedPopulation,
    disasterLevel: payload.disasterLevel ?? disaster.disasterLevel,
    responsePriorities: payload.responsePriorities ?? disaster.responsePriorities,
    latitude: payload.latitude ?? disaster.latitude,
    longitude: payload.longitude ?? disaster.longitude,
    activeCamps: payload.activeCamps ?? disaster.activeCamps,
    status: payload.status ?? disaster.status,
    isPublic: payload.isPublic ?? disaster.isPublic,
  });
  await disaster.save();

  const action = !wasActive && disaster.status === DISASTER_STATUS.ACTIVE
    ? 'Disaster activated'
    : 'Disaster updated';

  await writeAudit({
    user: admin,
    action,
    entityType: 'Disaster',
    entityId: disaster.disasterId,
    metadata: { status: disaster.status, disasterLevel: disaster.disasterLevel },
    ip,
  });

  if (!wasActive && disaster.status === DISASTER_STATUS.ACTIVE) {
    await createNotification({
      audience: 'all',
      title: 'Disaster Active',
      body: `${disaster.name} is now active.`,
      type: 'disaster_activated',
      relatedModel: 'Disaster',
      relatedId: disaster._id,
    });
  }

  return disaster;
}

module.exports = { listPublicDisasters, getActiveDisasters, createDisaster, updateDisaster };
