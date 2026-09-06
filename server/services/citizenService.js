const Citizen = require('../models/Citizen');
const Household = require('../models/Household');
const IdentityDocument = require('../models/IdentityDocument');
const PersonStatusHistory = require('../models/PersonStatusHistory');
const ReliefCamp = require('../models/ReliefCamp');
const { generateCitizenId, generateHouseholdId } = require('../utils/generateId');
const { calculateAge } = require('../utils/validators');
const { VERIFICATION_STATUS, PERSON_STATUS, VULNERABILITY_TYPES } = require('../utils/constants');
const { AppError } = require('../middleware/errorMiddleware');

function applyVulnerability(citizen) {
  const age = calculateAge(citizen.dateOfBirth);
  const types = new Set(citizen.vulnerabilityTypes || []);
  if (age !== null && age < 16) types.add('Child');
  if (age !== null && age >= 60) types.add('Elderly');
  citizen.vulnerabilityTypes = [...types];
  citizen.isVulnerable = citizen.vulnerabilityTypes.length > 0;
}

async function createCitizenProfile(user, payload) {
  const registrationId = await generateCitizenId();
  const citizen = await Citizen.create({
    user: user._id,
    registrationId,
    fullName: payload.fullName,
    dateOfBirth: payload.dateOfBirth,
    gender: payload.gender,
    bloodGroup: payload.bloodGroup || 'Unknown',
    phone: payload.phone || '',
    email: payload.email || user.email,
    permanentAddress: payload.permanentAddress || {},
    currentAddress: payload.currentAddress || payload.permanentAddress || {},
    emergencyContact: payload.emergencyContact || {},
    nationalId: payload.nationalId || '',
    citizenshipNumber: payload.citizenshipNumber || '',
    verificationStatus: VERIFICATION_STATUS.PENDING,
    disasterStatus: PERSON_STATUS.UNVERIFIED,
    publicDisplayName: payload.fullName,
    vulnerabilityTypes: (payload.vulnerabilityTypes || []).filter((item) => VULNERABILITY_TYPES.includes(item)),
    specialAssistanceNotes: payload.specialAssistanceNotes || '',
  });

  applyVulnerability(citizen);
  await citizen.save();

  if (payload.createHousehold) {
    const household = await Household.create({
      householdId: await generateHouseholdId(),
      headOfHousehold: citizen._id,
      permanentAddress: citizen.permanentAddress,
      currentAddress: citizen.currentAddress,
      emergencyContact: citizen.emergencyContact,
      members: [{ citizen: citizen._id, relationship: 'Head of Household' }],
      memberCount: 1,
    });
    citizen.household = household._id;
    citizen.relationshipToHead = 'Head of Household';
    await citizen.save();
  }

  user.citizen = citizen._id;
  await user.save();
  return citizen;
}

async function getCitizenByUser(userId) {
  return Citizen.findOne({ user: userId })
    .select('+specialAssistanceNotes')
    .populate({
      path: 'household',
      populate: { path: 'members.citizen', select: 'fullName registrationId disasterStatus currentCamp currentSafeZone photoUrl dateOfBirth gender verificationStatus lastKnownLocation statusUpdatedAt' },
    })
    .populate('currentCamp', 'name campId district location')
    .populate('currentSafeZone', 'name safeZoneId ward location');
}

function requiredDocumentsForAge(dateOfBirth) {
  const age = calculateAge(dateOfBirth);
  if (age === null) return [];
  if (age < 16) {
    return ['Birth Certificate', 'Recent Photograph'];
  }
  return ['Citizenship Certificate or National ID', 'Recent Photograph'];
}

async function searchCitizensAuthorized(query) {
  const filter = { isSuspended: { $ne: true } };
  const and = [];

  if (query.registrationId) {
    and.push({ registrationId: { $regex: String(query.registrationId).trim(), $options: 'i' } });
  }
  if (query.fullName) {
    and.push({ fullName: { $regex: String(query.fullName).trim(), $options: 'i' } });
  }
  if (query.phone) {
    and.push({ phone: { $regex: String(query.phone).trim(), $options: 'i' } });
  }
  if (query.nationalId) {
    and.push({
      $or: [
        { nationalId: { $regex: String(query.nationalId).trim(), $options: 'i' } },
        { citizenshipNumber: { $regex: String(query.nationalId).trim(), $options: 'i' } },
      ],
    });
  }
  if (query.dob) {
    const day = new Date(query.dob);
    if (!Number.isNaN(day.getTime())) {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      and.push({ dateOfBirth: { $gte: start, $lte: end } });
    }
  }
  if (query.householdId) {
    const household = await Household.findOne({
      householdId: { $regex: String(query.householdId).trim(), $options: 'i' },
    });
    if (!household) return [];
    and.push({ household: household._id });
  }
  if (query.status) and.push({ disasterStatus: query.status });
  if (query.verificationStatus) and.push({ verificationStatus: query.verificationStatus });
  if (query.district) and.push({ 'permanentAddress.district': { $regex: query.district, $options: 'i' } });

  if (and.length) filter.$and = and;

  return Citizen.find(filter)
    .select('+nationalId +citizenshipNumber +specialAssistanceNotes')
    .populate('household', 'householdId')
    .populate('currentCamp', 'name campId district location')
    .sort({ updatedAt: -1 })
    .limit(50);
}

async function updateCitizenStatus({ citizenId, newStatus, campId, official, location, notes, disasterId }) {
  if (newStatus === PERSON_STATUS.DECEASED && official.role !== 'admin') {
    throw new AppError('Only an administrator can record a deceased status', 403);
  }

  const citizen = await Citizen.findById(citizenId).populate('household').populate('user');
  if (!citizen) throw new AppError('Citizen not found', 404);

  const previousStatus = citizen.disasterStatus;
  const previousCamp = citizen.currentCamp;

  citizen.disasterStatus = newStatus;
  citizen.lastKnownLocation = location || citizen.lastKnownLocation;
  citizen.statusUpdatedAt = new Date();

  if (campId) {
    citizen.currentCamp = campId;
  } else if ([PERSON_STATUS.FOUND, PERSON_STATUS.MISSING, PERSON_STATUS.HOSPITALIZED].includes(newStatus) && newStatus !== PERSON_STATUS.IN_RELIEF_CAMP) {
    if (newStatus === PERSON_STATUS.HOSPITALIZED || newStatus === PERSON_STATUS.MISSING) {
      if (newStatus !== PERSON_STATUS.IN_RELIEF_CAMP && newStatus !== PERSON_STATUS.TRANSFERRED) {
        // keep camp unless transferred away without a new camp
      }
    }
  }

  if (newStatus === PERSON_STATUS.MISSING) {
    citizen.isPublicMissingApproved = true;
  }
  if ([PERSON_STATUS.FOUND, PERSON_STATUS.IN_RELIEF_CAMP, PERSON_STATUS.HOSPITALIZED, PERSON_STATUS.TRANSFERRED].includes(newStatus)) {
    citizen.isPublicMissingApproved = true;
  }

  await citizen.save();

  await PersonStatusHistory.create({
    citizen: citizen._id,
    previousStatus,
    newStatus,
    camp: campId || citizen.currentCamp || undefined,
    official: official._id,
    officialId: official.campOfficial?.officialId || official.role,
    location: location || '',
    notes: notes || '',
    disaster: disasterId || undefined,
  });

  if (previousCamp && String(previousCamp) !== String(citizen.currentCamp || '')) {
    await recountCampPopulation(previousCamp);
  }
  if (citizen.currentCamp) {
    await recountCampPopulation(citizen.currentCamp);
  }

  return citizen;
}

async function recountCampPopulation(campId) {
  if (!campId) return;
  const [citizens, unregistered] = await Promise.all([
    Citizen.countDocuments({
      currentCamp: campId,
      disasterStatus: { $in: [PERSON_STATUS.IN_RELIEF_CAMP, PERSON_STATUS.FOUND, PERSON_STATUS.TRANSFERRED] },
    }),
    require('../models/UnregisteredPerson').countDocuments({ currentCamp: campId }),
  ]);
  await ReliefCamp.findByIdAndUpdate(campId, { currentPopulation: citizens + unregistered });
}

async function listDocuments(citizenId) {
  return IdentityDocument.find({ citizen: citizenId }).sort({ createdAt: -1 });
}

module.exports = {
  createCitizenProfile,
  getCitizenByUser,
  requiredDocumentsForAge,
  searchCitizensAuthorized,
  updateCitizenStatus,
  recountCampPopulation,
  applyVulnerability,
  listDocuments,
};
