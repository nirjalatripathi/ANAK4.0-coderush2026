const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const Disaster = require('../../models/Disaster');
const ReliefCamp = require('../../models/ReliefCamp');
const UnregisteredPerson = require('../../models/UnregisteredPerson');
const Donation = require('../../models/Donation');
const ContactMessage = require('../../models/ContactMessage');
const SafeZone = require('../../models/SafeZone');
const ReliefNeed = require('../../models/ReliefNeed');
const Shipment = require('../../models/Shipment');
const { PERSON_STATUS, DISASTER_STATUS, VERIFICATION_STATUS, PRIORITY } = require('../../utils/constants');
const { required, isEmail } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');

async function stats(req, res, next) {
  try {
    const [
      activeReliefCamps,
      activeDisasters,
      activeSafeZones,
      peopleInReliefCamps,
      criticalReliefNeeds,
      donationsInTransit,
    ] = await Promise.all([
      ReliefCamp.countDocuments({ isActive: true }),
      Disaster.countDocuments({ status: DISASTER_STATUS.ACTIVE }),
      SafeZone.countDocuments({ status: { $in: ['Active', 'Available', 'Declared Safe', 'Full'] }, isPublic: true }),
      ReliefCamp.aggregate([{ $group: { _id: null, total: { $sum: '$currentPopulation' } } }]),
      ReliefNeed.countDocuments({ priority: PRIORITY.CRITICAL, isPublished: true }),
      Donation.countDocuments({ status: { $in: ['In Transit', 'Arrived'] } }),
    ]);

    res.json({
      success: true,
      stats: {
        activeDisasters,
        activeSafeZones,
        activeReliefCamps,
        peopleInReliefCamps: peopleInReliefCamps[0]?.total || 0,
        criticalReliefNeeds,
        donationsInTransit,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function contact(req, res, next) {
  try {
    const missing = required(['name', 'email', 'subject', 'message'], req.body);
    if (missing.length) throw new AppError(`Missing required fields: ${missing.join(', ')}`, 400);
    if (!isEmail(req.body.email)) throw new AppError('Enter a valid email address', 400);
    const message = await ContactMessage.create({
      name: req.body.name,
      email: req.body.email,
      subject: req.body.subject,
      message: req.body.message,
    });
    res.status(201).json({ success: true, message: 'Your message has been received by the RAHAT help desk.', id: message._id });
  } catch (error) {
    next(error);
  }
}

async function constants(req, res, next) {
  try {
    const data = require('../../utils/constants');
    res.json({ success: true, constants: data });
  } catch (error) {
    next(error);
  }
}

async function extraCounts(req, res, next) {
  try {
    const [unregistered, donations, pendingVerification] = await Promise.all([
      UnregisteredPerson.countDocuments(),
      Donation.countDocuments(),
      Citizen.countDocuments({ verificationStatus: VERIFICATION_STATUS.PENDING }),
    ]);
    res.json({ success: true, unregistered, donations, pendingVerification });
  } catch (error) {
    next(error);
  }
}

module.exports = { stats, contact, constants, extraCounts };
