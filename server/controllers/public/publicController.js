const Citizen = require('../../models/Citizen');
const Household = require('../../models/Household');
const Disaster = require('../../models/Disaster');
const ReliefCamp = require('../../models/ReliefCamp');
const UnregisteredPerson = require('../../models/UnregisteredPerson');
const Donation = require('../../models/Donation');
const ContactMessage = require('../../models/ContactMessage');
const ReliefNeed = require('../../models/ReliefNeed');
const ImpactRecord = require('../../models/ImpactRecord');
const Shipment = require('../../models/Shipment');
const { PERSON_STATUS, DISASTER_STATUS, VERIFICATION_STATUS, PRIORITY } = require('../../utils/constants');
const { required, isEmail } = require('../../utils/validators');
const { AppError } = require('../../middleware/errorMiddleware');

async function stats(req, res, next) {
  try {
    const [
      activeReliefCamps,
      activeDisasters,
      peopleInReliefCamps,
      criticalReliefNeeds,
      donationsInTransit,
    ] = await Promise.all([
      ReliefCamp.countDocuments({ isActive: true, isDemo: { $ne: true } }),
      Disaster.countDocuments({ status: DISASTER_STATUS.ACTIVE, isDemo: { $ne: true } }),
      ReliefCamp.aggregate([
        { $match: { isDemo: { $ne: true } } },
        { $group: { _id: null, total: { $sum: '$currentPopulation' } } },
      ]),
      ReliefNeed.countDocuments({ priority: PRIORITY.CRITICAL, isPublished: true }),
      Donation.countDocuments({ status: { $in: ['In Transit', 'Arrived'] }, isDemo: { $ne: true } }),
    ]);

    res.json({
      success: true,
      stats: {
        activeDisasters,
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

    const { getSupabase } = require('../../config/supabase');
    const supabase = getSupabase();
    if (supabase) {
      const { error } = await supabase.from('contact_messages').insert({
        name: req.body.name,
        email: req.body.email,
        subject: req.body.subject,
        message: req.body.message,
      });
      if (error) {
        console.warn(`Supabase contact sync skipped: ${error.message}`);
      }
    }

    res.status(201).json({ success: true, message: 'Your message has been received by RAHAT.', id: message._id });
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

async function impactStories(req, res, next) {
  try {
    const records = await ImpactRecord.find({ donorFacing: true })
      .populate('donation', 'donationId kind amountNPR itemName isDemo status')
      .populate('camp', 'name district')
      .populate('verifiedBy', 'fullName')
      .sort({ verifiedAt: -1, createdAt: -1 })
      .limit(12);
    const stories = records
      .filter((row) => row.donation && !row.donation.isDemo)
      .map((row) => ({
        id: row._id,
        donationId: row.donation.donationId,
        itemName: row.itemName,
        amountUsedNPR: row.amountUsedNPR,
        quantityDelivered: row.quantityDelivered,
        unit: row.unit,
        peopleSupported: row.peopleSupported,
        location: row.location,
        camp: row.camp?.name || '',
        date: row.verifiedAt || row.createdAt,
        notes: row.notes,
        proofs: (row.proofs || []).filter((proof) => proof.donorFacing),
        verified: Boolean(row.verifiedAt),
      }));
    res.json({ success: true, stories });
  } catch (error) {
    next(error);
  }
}

module.exports = { stats, contact, constants, extraCounts, impactStories };
