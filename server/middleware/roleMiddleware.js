const { ROLES } = require('../utils/constants');
const { AppError } = require('./errorMiddleware');

function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      if (allowedRoles.includes(ROLES.ADMIN)) {
        return next(new AppError('Access Denied — Administrator privileges required.', 403));
      }
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
}

const adminOnly = authorize(ROLES.ADMIN);
const officialOrAdmin = authorize(ROLES.CAMP_OFFICIAL, ROLES.LOCAL_AUTHORITY, ROLES.ADMIN);
const localOrAdmin = authorize(ROLES.LOCAL_AUTHORITY, ROLES.ADMIN);
const donorOnly = authorize(ROLES.DONOR);
const donorOrAdmin = authorize(ROLES.DONOR, ROLES.ADMIN);
const citizenOnly = authorize(ROLES.CITIZEN);

function assertCampScope(user, campId) {
  if (!user) throw new AppError('Authentication required', 401);
  if (user.role === ROLES.ADMIN || user.role === ROLES.LOCAL_AUTHORITY) return;
  if (user.role !== ROLES.CAMP_OFFICIAL) {
    throw new AppError('You do not have permission to manage this camp', 403);
  }
  const assigned = user.campOfficial?.assignedCamp?._id || user.campOfficial?.assignedCamp;
  if (!assigned || String(assigned) !== String(campId)) {
    throw new AppError('Camp officials may only manage their assigned camp', 403);
  }
}

function assertMunicipalityScope(user, municipality) {
  if (!user) throw new AppError('Authentication required', 401);
  if (user.role === ROLES.ADMIN) return;
  if (user.role !== ROLES.LOCAL_AUTHORITY) {
    throw new AppError('Local authority privileges required', 403);
  }
  const allowed = user.localAuthority?.municipality;
  if (allowed && municipality && allowed !== municipality) {
    throw new AppError('This record is outside your authorised municipality', 403);
  }
}

module.exports = {
  authorize,
  adminOnly,
  officialOrAdmin,
  localOrAdmin,
  donorOnly,
  donorOrAdmin,
  citizenOnly,
  assertCampScope,
  assertMunicipalityScope,
};
