const User = require('../../models/User');
const generateToken = require('../../utils/generateToken');
const { ROLES } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email || !password) throw new AppError('Email and password are required', 400);

    const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      throw new AppError('Invalid administrator credentials', 401);
    }
    if (user.role !== ROLES.ADMIN) {
      throw new AppError('Access Denied — Administrator privileges required.', 403);
    }
    if (!user.isActive) throw new AppError('This administrator account is inactive', 403);

    user.lastLoginAt = new Date();
    await user.save();

    res.json({
      success: true,
      token: generateToken(user),
      user: user.toSafeObject(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { adminLogin };
