const Citizen = require('../../models/Citizen');
const { reviewCitizen } = require('../../services/verificationService');
const { VERIFICATION_STATUS } = require('../../utils/constants');
const { AppError } = require('../../middleware/errorMiddleware');

async function queue(req, res, next) {
  try {
    const citizens = await Citizen.find({
      verificationStatus: {
        $in: [VERIFICATION_STATUS.PENDING, VERIFICATION_STATUS.RESUBMISSION],
      },
    })
      .populate('household', 'householdId')
      .sort({ createdAt: 1 });
    res.json({ success: true, citizens });
  } catch (error) {
    next(error);
  }
}

async function decide(req, res, next) {
  try {
    const { decision, notes } = req.body;
    if (!['approve', 'reject', 'resubmit'].includes(decision)) {
      throw new AppError('Decision must be approve, reject, or resubmit', 400);
    }
    const citizen = await reviewCitizen({
      citizenId: req.params.id,
      decision,
      notes,
      admin: req.user,
      ip: req.ip,
    });
    res.json({ success: true, citizen });
  } catch (error) {
    next(error);
  }
}

module.exports = { queue, decide };
