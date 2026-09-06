const UnregisteredPerson = require('../../models/UnregisteredPerson');
const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const PersonStatusHistory = require('../../models/PersonStatusHistory');
const { generateUnregisteredId } = require('../../utils/generateId');
const { recountCampPopulation } = require('../../services/citizenService');
const { writeAudit } = require('../../services/auditService');
const { UNREGISTERED_STATUS, PERSON_STATUS } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function create(req, res, next) {
  try {
    const campId = req.body.currentCamp || req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
    const person = await UnregisteredPerson.create({
      temporaryId: await generateUnregisteredId(),
      name: req.body.name || 'Unknown',
      approximateAge: req.body.approximateAge || '',
      gender: req.body.gender || 'Unknown',
      photoUrl: req.file ? `/uploads/unregistered/${req.file.filename}` : '',
      currentLocation: req.body.currentLocation || '',
      previousLocation: req.body.previousLocation || '',
      countryOfOrigin: req.body.countryOfOrigin || '',
      districtOfOrigin: req.body.districtOfOrigin || '',
      familyInformation: req.body.familyInformation || '',
      emergencyContact: {
        name: req.body.emergencyName || '',
        phone: req.body.emergencyPhone || '',
      },
      availableId: req.body.availableId || '',
      status: UNREGISTERED_STATUS.UNVERIFIED,
      disasterStatus: req.body.disasterStatus || PERSON_STATUS.IN_RELIEF_CAMP,
      currentCamp: campId || undefined,
      problems: req.body.problems || req.body.notes || '',
      notes: req.body.notes || '',
      createdBy: req.user._id,
    });

    if (campId) await recountCampPopulation(campId);

    await PersonStatusHistory.create({
      unregisteredPerson: person._id,
      newStatus: person.disasterStatus,
      camp: campId || undefined,
      official: req.user._id,
      officialId: req.user.campOfficial?.officialId || req.user.role,
      location: person.currentLocation,
      notes: 'Unregistered person created',
    });

    await writeAudit({
      user: req.user,
      action: 'Unregistered person created',
      entityType: 'UnregisteredPerson',
      entityId: person.temporaryId,
      metadata: { name: person.name, campId },
      ip: req.ip,
    });

    res.status(201).json({ success: true, person });
  } catch (error) {
    next(error);
  }
}

async function list(req, res, next) {
  try {
    const filter = {};
    if (req.user.role === 'camp_official') {
      const campId = req.user.campOfficial?.assignedCamp?._id || req.user.campOfficial?.assignedCamp;
      filter.currentCamp = campId;
    }
    if (req.query.status) filter.status = req.query.status;
    if (req.query.q) {
      filter.$or = [
        { name: { $regex: req.query.q, $options: 'i' } },
        { temporaryId: { $regex: req.query.q, $options: 'i' } },
      ];
    }
    const people = await UnregisteredPerson.find(filter)
      .populate('currentCamp', 'name campId district')
      .populate('matchedCitizen', 'fullName registrationId')
      .populate('matchedHousehold', 'householdId')
      .sort({ createdAt: -1 });
    res.json({ success: true, people });
  } catch (error) {
    next(error);
  }
}

async function details(req, res, next) {
  try {
    const person = await UnregisteredPerson.findById(req.params.id)
      .populate('currentCamp')
      .populate('matchedCitizen')
      .populate('matchedHousehold')
      .populate('createdBy', 'fullName role');
    if (!person) throw new AppError('Unregistered person not found', 404);
    res.json({ success: true, person });
  } catch (error) {
    next(error);
  }
}

async function matchCitizen(req, res, next) {
  try {
    const person = await UnregisteredPerson.findById(req.params.id);
    if (!person) throw new AppError('Unregistered person not found', 404);
    const citizen = await Citizen.findOne({
      $or: [{ _id: req.body.citizenId }, { registrationId: req.body.registrationId }],
    });
    if (!citizen) throw new AppError('Citizen not found', 404);

    person.matchedCitizen = citizen._id;
    person.matchedHousehold = citizen.household || person.matchedHousehold;
    person.status = UNREGISTERED_STATUS.MATCHED;
    person.verifiedBy = req.user._id;
    person.verifiedAt = new Date();
    await person.save();

    await writeAudit({
      user: req.user,
      action: 'Unregistered person matched',
      entityType: 'UnregisteredPerson',
      entityId: person.temporaryId,
      metadata: { citizen: citizen.registrationId },
      ip: req.ip,
    });
    res.json({ success: true, person });
  } catch (error) {
    next(error);
  }
}

async function matchHousehold(req, res, next) {
  try {
    const person = await UnregisteredPerson.findById(req.params.id);
    if (!person) throw new AppError('Unregistered person not found', 404);
    const household = await Household.findOne({
      $or: [{ _id: req.body.householdId }, { householdId: req.body.householdCode }],
    });
    if (!household) throw new AppError('Household not found', 404);
    person.matchedHousehold = household._id;
    person.status = UNREGISTERED_STATUS.MATCHED;
    person.verifiedBy = req.user._id;
    person.verifiedAt = new Date();
    await person.save();
    res.json({ success: true, person });
  } catch (error) {
    next(error);
  }
}

async function verify(req, res, next) {
  try {
    const person = await UnregisteredPerson.findById(req.params.id);
    if (!person) throw new AppError('Unregistered person not found', 404);
    person.status = UNREGISTERED_STATUS.VERIFIED;
    person.verifiedBy = req.user._id;
    person.verifiedAt = new Date();
    if (req.body.notes) person.notes = req.body.notes;
    await person.save();
    await writeAudit({
      user: req.user,
      action: 'Unregistered person verified',
      entityType: 'UnregisteredPerson',
      entityId: person.temporaryId,
      metadata: {},
      ip: req.ip,
    });
    res.json({ success: true, person });
  } catch (error) {
    next(error);
  }
}

async function convertToCitizen(req, res, next) {
  try {
    const person = await UnregisteredPerson.findById(req.params.id);
    if (!person) throw new AppError('Unregistered person not found', 404);
    if (!req.body.dateOfBirth || !req.body.gender || !req.body.fullName) {
      throw new AppError('Full name, date of birth, and gender are required to create a citizen record', 400);
    }

    const { createCitizenProfile } = require('../../services/citizenService');
    const User = require('../../models/User');
    const { ROLES } = require('../../utils/constants');

    const email = req.body.email || `${person.temporaryId.toLowerCase()}@unreg.rahat.local`;
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        email,
        password: `Temp${Math.random().toString(36).slice(-8)}A1`,
        fullName: req.body.fullName,
        role: ROLES.CITIZEN,
      });
    }

    const citizen = await createCitizenProfile(user, {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      phone: req.body.phone || person.emergencyContact?.phone || '',
      email,
      permanentAddress: req.body.permanentAddress || {},
      createHousehold: !req.body.householdId,
    });

    if (req.body.householdId) {
      const household = await Household.findById(req.body.householdId);
      if (household) {
        household.members.push({ citizen: citizen._id, relationship: req.body.relationship || 'Other' });
        household.syncMemberCount();
        await household.save();
        citizen.household = household._id;
        citizen.relationshipToHead = req.body.relationship || 'Other';
        await citizen.save();
      }
    }

    citizen.currentCamp = person.currentCamp;
    citizen.disasterStatus = person.disasterStatus || PERSON_STATUS.IN_RELIEF_CAMP;
    citizen.photoUrl = person.photoUrl;
    citizen.verificationStatus = req.body.markVerified ? 'Verified' : citizen.verificationStatus;
    await citizen.save();

    person.matchedCitizen = citizen._id;
    person.matchedHousehold = citizen.household;
    person.status = UNREGISTERED_STATUS.CONVERTED;
    person.verifiedBy = req.user._id;
    person.verifiedAt = new Date();
    await person.save();

    await writeAudit({
      user: req.user,
      action: 'Unregistered person verified',
      entityType: 'UnregisteredPerson',
      entityId: person.temporaryId,
      metadata: { convertedTo: citizen.registrationId },
      ip: req.ip,
    });

    res.json({ success: true, person, citizen });
  } catch (error) {
    next(error);
  }
}

module.exports = { create, list, details, matchCitizen, matchHousehold, verify, convertToCitizen };
