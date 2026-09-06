const SafeZone = require('../models/SafeZone');
const SafeZoneCheckIn = require('../models/SafeZoneCheckIn');
const Transfer = require('../models/Transfer');
const Disaster = require('../models/Disaster');
const Citizen = require('../models/Citizen');
const Household = require('../models/Household');
const UnregisteredPerson = require('../models/UnregisteredPerson');
const ReliefCamp = require('../models/ReliefCamp');
const PersonStatusHistory = require('../models/PersonStatusHistory');
const { generateSafeZoneId } = require('../utils/generateId');
const { SAFE_ZONE_STATUS, PERSON_STATUS, HOUSEHOLD_EVACUATION } = require('../utils/constants');
const { writeAudit } = require('./auditService');
const { createNotification } = require('./notificationService');
const { recountCampPopulation } = require('./citizenService');
const { AppError } = require('../middleware/errorMiddleware');

async function recountSafeZone(safeZoneId) {
  if (!safeZoneId) return null;
  const present = await SafeZoneCheckIn.aggregate([
    { $match: { safeZone: safeZoneId, status: 'Present' } },
    { $group: { _id: null, total: { $sum: '$familyMembersCount' } } },
  ]);
  const occupancy = present[0]?.total || 0;
  const zone = await SafeZone.findById(safeZoneId);
  if (!zone) return null;
  zone.currentOccupancy = occupancy;
  if (zone.status === SAFE_ZONE_STATUS.ACTIVE && zone.capacity && occupancy >= zone.capacity) {
    zone.status = SAFE_ZONE_STATUS.FULL;
  } else if (zone.status === SAFE_ZONE_STATUS.FULL && occupancy < zone.capacity) {
    zone.status = SAFE_ZONE_STATUS.ACTIVE;
  }
  await zone.save();
  return zone;
}

async function createSafeZone(payload, user, ip) {
  const zone = await SafeZone.create({
    safeZoneId: await generateSafeZoneId(),
    name: payload.name,
    localGovernment: payload.localGovernment || undefined,
    municipality: payload.municipality || '',
    district: payload.district || '',
    ward: payload.ward || '',
    location: payload.location || '',
    latitude: payload.latitude,
    longitude: payload.longitude,
    capacity: payload.capacity || 0,
    accessibleFor: payload.accessibleFor || '',
    facilities: payload.facilities || [],
    hazards: payload.hazards || '',
    suitableDisasterTypes: payload.suitableDisasterTypes || [],
    minimumDisasterLevel: payload.minimumDisasterLevel || 1,
    maximumDisasterLevel: payload.maximumDisasterLevel || 4,
    status: payload.status || SAFE_ZONE_STATUS.PROPOSED,
    disaster: payload.disaster || undefined,
    assignedWards: payload.assignedWards || [],
    notes: payload.notes || '',
    isPublic: Boolean(payload.isPublic),
  });
  await writeAudit({
    user,
    action: 'Safe zone declared',
    entityType: 'SafeZone',
    entityId: zone.safeZoneId,
    metadata: { name: zone.name, status: zone.status },
    ip,
  });
  return zone;
}

function assertCompatible(zone, disaster) {
  if (!disaster) return;
  if (zone.suitableDisasterTypes?.length && !zone.suitableDisasterTypes.includes(disaster.type)) {
    throw new AppError(`This safe zone is not configured for ${disaster.type}`, 400);
  }
  const level = disaster.disasterLevel || 1;
  if (level < zone.minimumDisasterLevel || level > zone.maximumDisasterLevel) {
    throw new AppError('This safe zone is outside the configured disaster-level range', 400);
  }
}

async function declareSafeZone(id, payload, user, ip) {
  const zone = await SafeZone.findById(id);
  if (!zone) throw new AppError('Safe zone not found', 404);
  if ([SAFE_ZONE_STATUS.CLOSED, SAFE_ZONE_STATUS.TEMPORARILY_CLOSED].includes(zone.status) && payload.status === SAFE_ZONE_STATUS.ACTIVE) {
    throw new AppError('A closed safe zone cannot be activated until it is reassessed', 400);
  }
  const disaster = payload.disaster || zone.disaster
    ? await Disaster.findById(payload.disaster || zone.disaster)
    : null;
  if (payload.status === SAFE_ZONE_STATUS.ACTIVE || payload.status === SAFE_ZONE_STATUS.DECLARED_SAFE) {
    assertCompatible(zone, disaster);
  }
  if (payload.status) zone.status = payload.status;
  if (payload.disaster) zone.disaster = payload.disaster;
  if (payload.isPublic !== undefined) zone.isPublic = payload.isPublic;
  if (payload.assignedWards) zone.assignedWards = payload.assignedWards;
  zone.declaredBy = user._id;
  zone.declaredAt = new Date();
  await zone.save();

  if (disaster && !disaster.activeSafeZones.some((z) => String(z) === String(zone._id))) {
    disaster.activeSafeZones.push(zone._id);
    await disaster.save();
  }

  await writeAudit({
    user,
    action: payload.status === SAFE_ZONE_STATUS.CLOSED ? 'Safe zone closed' : 'Safe zone declared',
    entityType: 'SafeZone',
    entityId: zone.safeZoneId,
    metadata: { status: zone.status },
    ip,
  });

  if (zone.status === SAFE_ZONE_STATUS.ACTIVE && zone.isPublic) {
    await createNotification({
      audience: 'all',
      title: 'Safe zone declared',
      body: `${zone.name} is now an active public safe zone.`,
      type: 'safe_zone_declared',
    });
  }
  return zone;
}

async function checkIn({ citizenId, unregisteredId, householdId, safeZoneId, familyMembersCount, specialNeeds, currentCondition, notes, official, ip }) {
  if (householdId && !citizenId && !unregisteredId) {
    const household = await Household.findOne(
      String(householdId).startsWith('HH-') ? { householdId } : { _id: householdId }
    );
    if (!household) throw new AppError('Household not found', 404);
    const results = [];
    for (const member of household.members || []) {
      const memberId = member.citizen?._id || member.citizen;
      if (!memberId) continue;
      results.push(await checkIn({
        citizenId: memberId,
        safeZoneId,
        familyMembersCount: 1,
        specialNeeds,
        currentCondition,
        notes,
        official,
        ip,
      }));
    }
    if (!results.length) throw new AppError('This household has no members to check in', 400);
    return { household, checkIns: results, zone: results[results.length - 1].zone };
  }

  const zone = await SafeZone.findById(safeZoneId);
  if (!zone) throw new AppError('Safe zone not found', 404);
  if (![SAFE_ZONE_STATUS.ACTIVE, SAFE_ZONE_STATUS.DECLARED_SAFE, SAFE_ZONE_STATUS.FULL].includes(zone.status)) {
    throw new AppError('People can only be checked into an active or declared safe zone', 400);
  }
  if (zone.status === SAFE_ZONE_STATUS.CLOSED) throw new AppError('This safe zone is closed', 400);

  const addCount = Number(familyMembersCount || 1);
  if (zone.capacity && zone.currentOccupancy + addCount > zone.capacity && zone.status === SAFE_ZONE_STATUS.FULL) {
    throw new AppError('This safe zone is full. Transfer to another zone or request an override.', 409);
  }

  const citizen = citizenId ? await Citizen.findById(citizenId) : null;
  if (citizen?.currentSafeZone && String(citizen.currentSafeZone) !== String(zone._id) && !citizen.currentCamp) {
    const open = await SafeZoneCheckIn.findOne({ citizen: citizen._id, status: 'Present' });
    if (open) throw new AppError('This person is already present in another safe zone. Transfer them first.', 409);
  }

  const checkIn = await SafeZoneCheckIn.create({
    citizen: citizen?._id,
    unregisteredPerson: unregisteredId || undefined,
    household: householdId || citizen?.household || undefined,
    safeZone: zone._id,
    disaster: zone.disaster,
    familyMembersCount: addCount,
    specialNeeds: specialNeeds || '',
    currentCondition: currentCondition || '',
    status: 'Present',
    checkedInBy: official._id,
    notes: notes || '',
  });

  if (citizen) {
    citizen.disasterStatus = PERSON_STATUS.IN_SAFE_ZONE;
    citizen.currentSafeZone = zone._id;
    citizen.currentCamp = undefined;
    citizen.lastKnownLocation = zone.name;
    citizen.currentCondition = currentCondition || citizen.currentCondition;
    citizen.statusUpdatedAt = new Date();
    citizen.isPublicMissingApproved = true;
    await citizen.save();
    await PersonStatusHistory.create({
      citizen: citizen._id,
      previousStatus: PERSON_STATUS.MISSING,
      newStatus: PERSON_STATUS.IN_SAFE_ZONE,
      official: official._id,
      location: zone.name,
      notes: notes || 'Safe-zone check-in',
    });
    if (citizen.household) {
      await syncHouseholdEvacuation(citizen.household);
    }
  }

  if (unregisteredId) {
    await UnregisteredPerson.findByIdAndUpdate(unregisteredId, {
      currentLocation: zone.name,
      disasterStatus: PERSON_STATUS.IN_SAFE_ZONE,
    });
  }

  const updated = await recountSafeZone(zone._id);
  if (updated?.status === SAFE_ZONE_STATUS.FULL) {
    await createNotification({
      audience: 'role',
      role: 'admin',
      title: 'Safe zone full',
      body: `${zone.name} has reached capacity.`,
      type: 'safe_zone_full',
    });
  }

  await writeAudit({
    user: official,
    action: 'Person checked in',
    entityType: 'SafeZone',
    entityId: zone.safeZoneId,
    metadata: { citizen: citizen?.registrationId, unregisteredId, count: addCount },
    ip,
  });

  return { checkIn, zone: updated };
}

async function transferToCamp({ citizenId, unregisteredId, fromSafeZoneId, toCampId, reason, transport, notes, official, ip, overrideCapacity }) {
  const camp = await ReliefCamp.findById(toCampId);
  if (!camp) throw new AppError('Relief camp not found', 404);
  if (!overrideCapacity && camp.capacity && camp.currentPopulation >= camp.capacity) {
    throw new AppError('This camp is at capacity. An administrator must authorize an override.', 409);
  }

  const citizen = citizenId ? await Citizen.findById(citizenId) : null;
  const open = citizen
    ? await SafeZoneCheckIn.findOne({ citizen: citizen._id, status: 'Present' })
    : unregisteredId
      ? await SafeZoneCheckIn.findOne({ unregisteredPerson: unregisteredId, status: 'Present' })
      : null;

  const fromZoneId = fromSafeZoneId || open?.safeZone;
  if (open) {
    open.status = 'Transferred';
    open.checkedOutAt = new Date();
    await open.save();
  }

  if (citizen) {
    if (citizen.currentCamp && String(citizen.currentCamp) !== String(camp._id) && citizen.disasterStatus === PERSON_STATUS.IN_RELIEF_CAMP) {
      throw new AppError('This person is already recorded in another relief camp. Transfer them first.', 409);
    }
    citizen.disasterStatus = PERSON_STATUS.IN_RELIEF_CAMP;
    citizen.currentCamp = camp._id;
    citizen.currentSafeZone = undefined;
    citizen.lastKnownLocation = camp.name;
    citizen.statusUpdatedAt = new Date();
    await citizen.save();
    await PersonStatusHistory.create({
      citizen: citizen._id,
      previousStatus: PERSON_STATUS.IN_SAFE_ZONE,
      newStatus: PERSON_STATUS.IN_RELIEF_CAMP,
      camp: camp._id,
      official: official._id,
      location: camp.name,
      notes: notes || 'Transferred from safe zone to relief camp',
    });
    if (citizen.household) await syncHouseholdEvacuation(citizen.household);
  }

  if (unregisteredId) {
    await UnregisteredPerson.findByIdAndUpdate(unregisteredId, {
      currentCamp: camp._id,
      currentLocation: camp.name,
      disasterStatus: PERSON_STATUS.IN_RELIEF_CAMP,
    });
  }

  const transfer = await Transfer.create({
    citizen: citizen?._id,
    unregisteredPerson: unregisteredId || undefined,
    household: citizen?.household,
    fromSafeZone: fromZoneId || undefined,
    toCamp: camp._id,
    reason: reason || 'Shelter transfer',
    transport: transport || '',
    official: official._id,
    status: 'Arrived',
    notes: notes || '',
  });

  if (fromZoneId) await recountSafeZone(fromZoneId);
  await recountCampPopulation(camp._id);

  await writeAudit({
    user: official,
    action: 'Person transferred',
    entityType: 'Transfer',
    entityId: transfer._id,
    metadata: { toCamp: camp.campId, fromSafeZone: fromZoneId },
    ip,
  });

  return transfer;
}

async function syncHouseholdEvacuation(householdId) {
  const household = await Household.findById(householdId).populate('members.citizen', 'disasterStatus currentSafeZone currentCamp');
  if (!household) return;
  const members = household.members.map((m) => m.citizen).filter(Boolean);
  const statuses = new Set(members.map((m) => m.disasterStatus));
  const inCamp = members.filter((m) => m.disasterStatus === PERSON_STATUS.IN_RELIEF_CAMP);
  const inZone = members.filter((m) => m.disasterStatus === PERSON_STATUS.IN_SAFE_ZONE);
  if (statuses.size > 1 && (inCamp.length || inZone.length || statuses.has(PERSON_STATUS.HOSPITALIZED))) {
    household.evacuationStatus = HOUSEHOLD_EVACUATION.SEPARATED;
  } else if (inCamp.length === members.length && members.length) {
    household.evacuationStatus = HOUSEHOLD_EVACUATION.IN_RELIEF_CAMP;
  } else if (inZone.length === members.length && members.length) {
    household.evacuationStatus = HOUSEHOLD_EVACUATION.IN_SAFE_ZONE;
  } else if (inZone.length || inCamp.length) {
    household.evacuationStatus = HOUSEHOLD_EVACUATION.EVACUATED;
  }
  household.currentSafeZone = inZone[0]?.currentSafeZone;
  household.currentCamp = inCamp[0]?.currentCamp;
  await household.save();
}

function haversineKm(lat1, lon1, lat2, lon2) {
  if ([lat1, lon1, lat2, lon2].some((n) => n === undefined || n === null)) return null;
  const toRad = (d) => (d * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 10) / 10;
}

module.exports = {
  recountSafeZone,
  createSafeZone,
  declareSafeZone,
  checkIn,
  transferToCamp,
  syncHouseholdEvacuation,
  haversineKm,
  assertCompatible,
};
