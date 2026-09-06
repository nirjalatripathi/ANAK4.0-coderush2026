const Citizen = require('../../models/Citizen');
const IdentityDocument = require('../../models/IdentityDocument');
const { getCitizenByUser, requiredDocumentsForAge, applyVulnerability } = require('../../services/citizenService');
const { documentRequirements } = require('../../services/verificationService');
const { VERIFICATION_STATUS } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function getProfile(req, res, next) {
  try {
    const citizen = await getCitizenByUser(req.user._id);
    if (!citizen) throw new AppError('Citizen profile not found', 404);
    res.json({
      success: true,
      citizen,
      documentRequirements: documentRequirements(citizen.dateOfBirth),
    });
  } catch (error) {
    next(error);
  }
}

async function updateProfile(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    if (!citizen) throw new AppError('Citizen profile not found', 404);

    const parseMaybe = (value) => {
      if (typeof value !== 'string') return value;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    };
    if (req.body.fullName) {
      citizen.fullName = req.body.fullName;
      citizen.publicDisplayName = req.body.fullName;
      req.user.fullName = req.body.fullName;
      await req.user.save();
    }
    if (req.body.dateOfBirth) citizen.dateOfBirth = req.body.dateOfBirth;
    if (req.body.gender) citizen.gender = req.body.gender;
    if (req.body.currentCondition !== undefined) citizen.currentCondition = req.body.currentCondition;
    citizen.phone = req.body.phone ?? citizen.phone;
    citizen.email = req.body.email ?? citizen.email;
    if (req.body.currentAddress) citizen.currentAddress = parseMaybe(req.body.currentAddress);
    if (req.body.emergencyContact) citizen.emergencyContact = parseMaybe(req.body.emergencyContact);
    if (req.body.bloodGroup) citizen.bloodGroup = req.body.bloodGroup;
    if (req.body.vulnerabilityTypes) {
      citizen.vulnerabilityTypes = req.body.vulnerabilityTypes;
      applyVulnerability(citizen);
    }
    if (req.body.specialAssistanceNotes !== undefined) {
      citizen.specialAssistanceNotes = req.body.specialAssistanceNotes;
    }
    if (req.body.problems !== undefined) {
      citizen.specialAssistanceNotes = req.body.problems;
    }
    if (req.file) {
      citizen.photoUrl = `/uploads/profile-images/${req.file.filename}`;
    }
    applyVulnerability(citizen);
    await citizen.save();
    res.json({ success: true, citizen });
  } catch (error) {
    next(error);
  }
}

async function myDocuments(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    if (!citizen) throw new AppError('Citizen profile not found', 404);
    const documents = await IdentityDocument.find({ citizen: citizen._id }).select('-filePath');
    res.json({
      success: true,
      documents,
      requirements: requiredDocumentsForAge(citizen.dateOfBirth),
    });
  } catch (error) {
    next(error);
  }
}

async function uploadDocuments(req, res, next) {
  try {
    const citizen = await Citizen.findOne({ user: req.user._id });
    if (!citizen) throw new AppError('Citizen profile not found', 404);
    if (!req.files?.length) throw new AppError('Please attach at least one document', 400);

    const created = [];
    for (const file of req.files) {
      const documentType = req.body.documentType || req.body[`documentType_${file.fieldname}`] || 'Other';
      const doc = await IdentityDocument.create({
        citizen: citizen._id,
        documentType,
        filePath: file.path,
        originalName: file.originalname,
        mimeType: file.mimetype,
        reviewStatus: VERIFICATION_STATUS.PENDING,
      });
      created.push(doc);
    }

    if (citizen.verificationStatus === VERIFICATION_STATUS.REJECTED || citizen.verificationStatus === VERIFICATION_STATUS.RESUBMISSION) {
      citizen.verificationStatus = VERIFICATION_STATUS.PENDING;
      await citizen.save();
    }

    res.status(201).json({ success: true, documents: created });
  } catch (error) {
    next(error);
  }
}

module.exports = { getProfile, updateProfile, myDocuments, uploadDocuments };
