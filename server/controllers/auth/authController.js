const User = require('../../models/User');
const Citizen = require('../../models/Citizen');
const generateToken = require('../../utils/generateToken');
const { createCitizenProfile, requiredDocumentsForAge } = require('../../services/citizenService');
const { isEmail, isPhone, required, validateGender } = require('../../utils/validators');
const { ROLES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');
const { createNotification } = require('../../services/notificationService');

async function register(req, res, next) {
  try {
    const missing = required(
      ['fullName', 'email', 'password', 'dateOfBirth', 'gender', 'phone', 'district'],
      {
        ...req.body,
        district: req.body.district || req.body.permanentAddress?.district,
      }
    );
    if (missing.length) {
      throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    }
    if (!isEmail(req.body.email)) throw new AppError('Enter a valid email address', 400);
    if (!isPhone(req.body.phone)) throw new AppError('Enter a valid phone number', 400);
    if (!validateGender(req.body.gender)) throw new AppError('Select a valid gender', 400);
    if (String(req.body.password).length < 8) {
      throw new AppError('Password must be at least 8 characters', 400);
    }

    const exists = await User.findOne({ email: String(req.body.email).toLowerCase() });
    if (exists) throw new AppError('An account with this email already exists', 409);

    const user = await User.create({
      email: String(req.body.email).toLowerCase(),
      password: req.body.password,
      fullName: req.body.fullName,
      role: ROLES.CITIZEN,
    });

    const permanentAddress = req.body.permanentAddress || {
      street: req.body.permanentStreet || '',
      district: req.body.district || '',
      municipality: req.body.municipality || '',
      ward: req.body.ward || '',
    };
    const currentAddress = req.body.currentAddress || {
      street: req.body.currentStreet || permanentAddress.street,
      district: req.body.currentDistrict || permanentAddress.district,
      municipality: req.body.currentMunicipality || permanentAddress.municipality,
      ward: req.body.currentWard || permanentAddress.ward,
    };

    const citizen = await createCitizenProfile(user, {
      fullName: req.body.fullName,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      bloodGroup: req.body.bloodGroup,
      phone: req.body.phone,
      email: req.body.email,
      permanentAddress,
      currentAddress,
      emergencyContact: req.body.emergencyContact || {
        name: req.body.emergencyName || '',
        phone: req.body.emergencyPhone || '',
        relationship: req.body.emergencyRelationship || '',
      },
      nationalId: req.body.nationalId,
      citizenshipNumber: req.body.citizenshipNumber,
      vulnerabilityTypes: req.body.vulnerabilityTypes,
      specialAssistanceNotes: req.body.specialAssistanceNotes || req.body.problems,
      createHousehold: req.body.createHousehold !== false,
    });

    await createNotification({
      user: user._id,
      title: 'Registration received',
      body: `Your RAHAT registration ID is ${citizen.registrationId}. Submit identity documents for verification.`,
      type: 'system',
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please submit identity documents for verification.',
      token,
      user: user.toSafeObject(),
      citizen,
      documentRequirements: requiredDocumentsForAge(citizen.dateOfBirth),
    });
  } catch (error) {
    next(error);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid email or password', 401);
    }
    if (!user.isActive) throw new AppError('This account has been suspended', 403);

    user.lastLoginAt = new Date();
    await user.save();

    const populated = await User.findById(user._id)
      .populate('citizen')
      .populate({ path: 'campOfficial', populate: { path: 'assignedCamp', select: 'name campId district' } })
      .populate('localAuthority');

    res.json({
      success: true,
      token: generateToken(user),
      user: populated.toSafeObject(),
      citizen: populated.citizen,
      campOfficial: populated.campOfficial,
      localAuthority: populated.localAuthority,
    });
  } catch (error) {
    next(error);
  }
}

async function logout(req, res) {
  res.json({ success: true, message: 'Signed out' });
}

async function me(req, res, next) {
  try {
    const user = await User.findById(req.user._id)
      .populate('citizen')
      .populate({ path: 'campOfficial', populate: { path: 'assignedCamp' } })
      .populate('localAuthority');
    res.json({
      success: true,
      user: user.toSafeObject(),
      citizen: user.citizen,
      campOfficial: user.campOfficial,
      localAuthority: user.localAuthority,
    });
  } catch (error) {
    next(error);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email, phone, newPassword } = req.body;
    if (!email || !phone || !newPassword) {
      throw new AppError('Email, registered phone, and a new password are required', 400);
    }
    if (String(newPassword).length < 8) throw new AppError('Password must be at least 8 characters', 400);

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user) throw new AppError('No matching account was found', 404);

    if (user.role === ROLES.CITIZEN) {
      const citizen = await Citizen.findOne({ user: user._id });
      if (!citizen || citizen.phone !== String(phone).trim()) {
        throw new AppError('The phone number does not match this registration', 400);
      }
    } else {
      throw new AppError('Official accounts must reset passwords through an administrator', 403);
    }

    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: 'Password updated. You may now sign in.' });
  } catch (error) {
    next(error);
  }
}

async function registerDonor(req, res, next) {
  try {
    const missing = required(['fullName', 'email', 'password'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    if (!isEmail(req.body.email)) throw new AppError('Enter a valid email address', 400);
    if (String(req.body.password).length < 8) throw new AppError('Password must be at least 8 characters', 400);
    const exists = await User.findOne({ email: String(req.body.email).toLowerCase() });
    if (exists) throw new AppError('An account with this email already exists', 409);
    const user = await User.create({
      email: String(req.body.email).toLowerCase(),
      password: req.body.password,
      fullName: req.body.fullName,
      role: ROLES.DONOR,
    });
    const token = generateToken(user);
    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject(),
      message: 'Donor account created. You can now pledge against verified needs.',
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { register, registerDonor, login, logout, me, forgotPassword };
