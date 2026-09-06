const ReliefCamp = require('../models/ReliefCamp');
const CampInventory = require('../models/CampInventory');
const { INVENTORY_ITEMS } = require('../utils/constants');
const { syncReliefNeeds } = require('./reliefEngine');
const { generateCampId } = require('../utils/generateId');
const { writeAudit } = require('./auditService');
const { AppError } = require('../middleware/errorMiddleware');

async function ensureDefaultInventory(campId, userId) {
  const existing = await CampInventory.find({ camp: campId });
  if (existing.length) return existing;
  const docs = INVENTORY_ITEMS.filter((name) => name !== 'Other').map((itemName) => ({
    camp: campId,
    itemName,
    current: 0,
    required: 0,
    incoming: 0,
    distributed: 0,
    lastUpdatedBy: userId,
  }));
  return CampInventory.insertMany(docs);
}

async function createCamp(payload, admin, ip) {
  const camp = await ReliefCamp.create({
    campId: await generateCampId(),
    name: payload.name,
    location: payload.location || '',
    district: payload.district || '',
    municipality: payload.municipality || '',
    ward: payload.ward || '',
    campHead: payload.campHead || '',
    contactPhone: payload.contactPhone || '',
    contactEmail: payload.contactEmail || '',
    capacity: payload.capacity || 0,
    currentPopulation: payload.currentPopulation || 0,
    beds: payload.beds || 0,
    medicalStatus: payload.medicalStatus || 'Adequate',
    foodStatus: payload.foodStatus || 'Adequate',
    waterStatus: payload.waterStatus || 'Adequate',
    sanitationStatus: payload.sanitationStatus || 'Adequate',
    disaster: payload.disaster || undefined,
    notes: payload.notes || '',
  });

  await ensureDefaultInventory(camp._id, admin._id);
  await writeAudit({
    user: admin,
    action: 'Camp created',
    entityType: 'ReliefCamp',
    entityId: camp.campId,
    metadata: { name: camp.name },
    ip,
  });
  return camp;
}

async function updateCamp(id, payload, admin, ip) {
  const camp = await ReliefCamp.findById(id);
  if (!camp) throw new AppError('Relief camp not found', 404);
  const fields = [
    'name', 'location', 'district', 'municipality', 'ward', 'campHead',
    'contactPhone', 'contactEmail', 'capacity', 'beds', 'medicalStatus',
    'foodStatus', 'waterStatus', 'sanitationStatus', 'disaster', 'isActive', 'notes',
  ];
  fields.forEach((field) => {
    if (payload[field] !== undefined) camp[field] = payload[field];
  });
  await camp.save();
  await writeAudit({
    user: admin,
    action: 'Camp updated',
    entityType: 'ReliefCamp',
    entityId: camp.campId,
    metadata: { name: camp.name },
    ip,
  });
  return camp;
}

async function updateInventoryItem({ campId, itemName, updates, user, ip }) {
  let item = await CampInventory.findOne({ camp: campId, itemName });
  if (!item) {
    item = await CampInventory.create({ camp: campId, itemName });
  }
  ['current', 'required', 'incoming', 'distributed', 'dailyConsumption', 'unit', 'notes'].forEach((field) => {
    if (updates[field] !== undefined) item[field] = updates[field];
  });
  item.lastUpdatedBy = user._id;
  item.recalculatePriority();
  await item.save();
  await syncReliefNeeds(campId);
  await writeAudit({
    user,
    action: 'Inventory changed',
    entityType: 'CampInventory',
    entityId: `${campId}:${itemName}`,
    metadata: { itemName, current: item.current, required: item.required, shortage: item.shortage },
    ip,
  });
  return item;
}

function assertOfficialCampAccess(user, campId) {
  if (user.role === 'admin') return;
  const assigned = user.campOfficial?.assignedCamp;
  const assignedId = assigned?._id || assigned;
  if (!assignedId || String(assignedId) !== String(campId)) {
    throw new AppError('You may only manage your assigned relief camp', 403);
  }
}

module.exports = {
  syncReliefNeeds,
  ensureDefaultInventory,
  createCamp,
  updateCamp,
  updateInventoryItem,
  assertOfficialCampAccess,
};
