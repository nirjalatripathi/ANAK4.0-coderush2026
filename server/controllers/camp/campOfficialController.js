const User = require('../../models/User');
const CampOfficial = require('../../models/CampOfficial');
const ReliefCamp = require('../../models/ReliefCamp');
const { generateOfficialId } = require('../../utils/generateId');
const { ROLES } = require('../../utils/constants');
const { writeAudit } = require('../../services/auditService');
const { AppError } = require('../../middleware/errorMiddleware');

async function myAssignment(req, res, next) {
  try {
    const official = await CampOfficial.findOne({ user: req.user._id }).populate('assignedCamp');
    if (!official) throw new AppError('Camp official profile not found', 404);
    res.json({ success: true, official });
  } catch (error) {
    next(error);
  }
}

async function listOfficials(req, res, next) {
  try {
    const officials = await CampOfficial.find()
      .populate('user', 'email isActive lastLoginAt')
      .populate('assignedCamp', 'name campId district');
    res.json({ success: true, officials });
  } catch (error) {
    next(error);
  }
}

async function createOfficial(req, res, next) {
  try {
    const { email, password, fullName, assignedCamp, phone, designation } = req.body;
    if (!email || !password || !fullName || !assignedCamp) {
      throw new AppError('Email, password, full name, and assigned camp are required', 400);
    }
    const camp = await ReliefCamp.findById(assignedCamp);
    if (!camp) throw new AppError('Assigned camp not found', 404);
    const exists = await User.findOne({ email: String(email).toLowerCase() });
    if (exists) throw new AppError('An account with this email already exists', 409);

    const user = await User.create({
      email: String(email).toLowerCase(),
      password,
      fullName,
      role: ROLES.CAMP_OFFICIAL,
    });
    const official = await CampOfficial.create({
      user: user._id,
      officialId: await generateOfficialId(),
      fullName,
      assignedCamp: camp._id,
      phone: phone || '',
      designation: designation || 'Camp Official',
    });
    user.campOfficial = official._id;
    await user.save();

    await writeAudit({
      user: req.user,
      action: 'Camp official created',
      entityType: 'CampOfficial',
      entityId: official.officialId,
      metadata: { email, camp: camp.campId },
      ip: req.ip,
    });

    res.status(201).json({ success: true, official, user: user.toSafeObject() });
  } catch (error) {
    next(error);
  }
}

async function updateOfficial(req, res, next) {
  try {
    const official = await CampOfficial.findById(req.params.id);
    if (!official) throw new AppError('Camp official not found', 404);
    if (req.body.fullName) official.fullName = req.body.fullName;
    if (req.body.phone !== undefined) official.phone = req.body.phone;
    if (req.body.designation) official.designation = req.body.designation;
    if (req.body.assignedCamp) official.assignedCamp = req.body.assignedCamp;
    if (req.body.isActive !== undefined) {
      official.isActive = req.body.isActive;
      await User.findByIdAndUpdate(official.user, { isActive: req.body.isActive });
    }
    await official.save();
    res.json({ success: true, official });
  } catch (error) {
    next(error);
  }
}

module.exports = { myAssignment, listOfficials, createOfficial, updateOfficial };
