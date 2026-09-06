const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { AppError } = require('./errorMiddleware');

async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id)
      .populate('citizen')
      .populate({
        path: 'campOfficial',
        populate: { path: 'assignedCamp' },
      })
      .populate('localAuthority');

    if (!user || !user.isActive) {
      throw new AppError('Account is inactive or no longer valid', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(error);
    }
    next(error);
  }
}

function optionalAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err || !decoded) return next();
    try {
      const user = await User.findById(decoded.id);
      if (user && user.isActive) req.user = user;
    } catch {
      /* ignore invalid optional sessions */
    }
    next();
  });
}

module.exports = { protect, optionalAuth };
