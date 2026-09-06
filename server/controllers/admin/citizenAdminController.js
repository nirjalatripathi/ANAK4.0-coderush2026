const path = require('path');
const fs = require('fs');
const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const IdentityDocument = require('../../models/IdentityDocument');
const PersonStatusHistory = require('../../models/PersonStatusHistory');
const { searchCitizensAuthorized, applyVulnerability } = require('../../services/citizenService');
const { writeAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorMiddleware');

async function listCitizens(req, res, next) {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const filter = {};
    if (req.query.verificationStatus) filter.verificationStatus = req.query.verificationStatus;
    if (req.query.disasterStatus) filter.disasterStatus = req.query.disasterStatus;
    if (req.query.district) filter['permanentAddress.district'] = { $regex: req.query.district, $options: 'i' };
    if (req.query.q) {
      filter.$or = [
        { fullName: { $regex: req.query.q, $options: 'i' } },
        { registrationId: { $regex: req.query.q, $options: 'i' } },
        { phone: { $regex: req.query.q, $options: 'i' } },
      ];
    }
    const [citizens, total] = await Promise.all([
      Citizen.find(filter)
        .populate('household', 'householdId')
        .populate('currentCamp', 'name campId')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Citizen.countDocuments(filter),
    ]);
    res.json({ success: true, citizens, total, page, pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
}

async function citizenDetails(req, res, next) {
  try {
    const citizen = await Citizen.findById(req.params.id)
      .select('+nationalId +citizenshipNumber +specialAssistanceNotes')
      .populate('household')
      .populate('currentCamp')
      .populate('user', 'email isActive lastLoginAt')
      .populate('verifiedBy', 'fullName');
    if (!citizen) throw new AppError('Citizen not found', 404);
    const [documents, history] = await Promise.all([
      IdentityDocument.find({ citizen: citizen._id }),
      PersonStatusHistory.find({ citizen: citizen._id }).populate('camp', 'name').populate('official', 'fullName role').sort({ createdAt: -1 }),
    ]);
    let household = citizen.household;
    if (household) {
      household = await Household.findById(household._id).populate('members.citizen', 'fullName registrationId disasterStatus currentCamp');
    }
    res.json({ success: true, citizen, documents, history, household });
  } catch (error) {
    next(error);
  }
}

async function updateCitizen(req, res, next) {
  try {
    const citizen = await Citizen.findById(req.params.id).select('+nationalId +citizenshipNumber +specialAssistanceNotes');
    if (!citizen) throw new AppError('Citizen not found', 404);
    const allowed = [
      'fullName', 'phone', 'email', 'bloodGroup', 'permanentAddress', 'currentAddress',
      'emergencyContact', 'nationalId', 'citizenshipNumber', 'isSuspended',
      'isPublicMissingApproved', 'publicDisplayName', 'vulnerabilityTypes', 'specialAssistanceNotes',
    ];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) citizen[field] = req.body[field];
    });
    applyVulnerability(citizen);
    if (req.body.isSuspended && citizen.user) {
      const User = require('../../models/User');
      await User.findByIdAndUpdate(citizen.user, { isActive: !req.body.isSuspended ? true : false });
    }
    await citizen.save();
    await writeAudit({
      user: req.user,
      action: req.body.isSuspended ? 'Citizen suspended' : 'Citizen updated',
      entityType: 'Citizen',
      entityId: citizen.registrationId,
      metadata: req.body,
      ip: req.ip,
    });
    res.json({ success: true, citizen });
  } catch (error) {
    next(error);
  }
}

async function search(req, res, next) {
  try {
    const citizens = await searchCitizensAuthorized(req.query);
    res.json({ success: true, citizens });
  } catch (error) {
    next(error);
  }
}

async function serveDocument(req, res, next) {
  try {
    const doc = await IdentityDocument.findById(req.params.docId);
    if (!doc) throw new AppError('Document not found', 404);
    const absolute = path.isAbsolute(doc.filePath) ? doc.filePath : path.join(__dirname, '..', '..', doc.filePath);
    if (!fs.existsSync(absolute)) throw new AppError('Document file is missing', 404);
    res.sendFile(absolute);
  } catch (error) {
    next(error);
  }
}

async function listHouseholds(req, res, next) {
  try {
    const filter = {};
    if (req.query.q) {
      filter.householdId = { $regex: req.query.q, $options: 'i' };
    }
    const households = await Household.find(filter)
      .populate('headOfHousehold', 'fullName registrationId')
      .populate('members.citizen', 'fullName registrationId disasterStatus')
      .sort({ createdAt: -1 });
    res.json({ success: true, households });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCitizens, citizenDetails, updateCitizen, search, serveDocument, listHouseholds };
