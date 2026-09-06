const Citizen = require('../../models/Citizen');
const { sanitizePublicCitizen } = require('../../utils/validators');
const { PERSON_STATUS } = require('../../utils/constants');

async function publicList(req, res, next) {
  try {
    const filter = { isPublicMissingApproved: true };
    if (req.query.status) {
      filter.disasterStatus = req.query.status;
    } else {
      filter.disasterStatus = {
        $in: [
          PERSON_STATUS.MISSING,
          PERSON_STATUS.FOUND,
          PERSON_STATUS.IN_RELIEF_CAMP,
          PERSON_STATUS.HOSPITALIZED,
          PERSON_STATUS.TRANSFERRED,
        ],
      };
    }
    if (req.query.q) {
      filter.fullName = { $regex: req.query.q, $options: 'i' };
    }

    const citizens = await Citizen.find(filter)
      .populate('currentCamp', 'name district')
      .populate('household', 'householdId')
      .sort({ statusUpdatedAt: -1 })
      .limit(80);

    res.json({
      success: true,
      records: citizens.map(sanitizePublicCitizen),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { publicList };
