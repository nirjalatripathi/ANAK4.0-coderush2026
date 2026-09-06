const ReliefCamp = require('../../models/ReliefCamp');
const CampInventory = require('../../models/CampInventory');
const Citizen = require('../../models/Citizen');
const UnregisteredPerson = require('../../models/UnregisteredPerson');
const { createCamp, updateCamp } = require('../../services/campService');
const { AppError } = require('../../middleware/errorMiddleware');

async function listCamps(req, res, next) {
  try {
    const filter = {};
    if (req.query.district) filter.district = { $regex: req.query.district, $options: 'i' };
    if (req.query.active === 'true') filter.isActive = true;
    const camps = await ReliefCamp.find(filter).populate('disaster', 'name status type').sort({ name: 1 });
    res.json({ success: true, camps });
  } catch (error) {
    next(error);
  }
}

async function campDetails(req, res, next) {
  try {
    const camp = await ReliefCamp.findById(req.params.id).populate('disaster', 'name status type');
    if (!camp) throw new AppError('Relief camp not found', 404);
    const inventory = await CampInventory.find({ camp: camp._id });
    res.json({
      success: true,
      camp: {
        ...camp.toJSON(),
        occupancyPercent: camp.capacity ? Math.round((camp.currentPopulation / camp.capacity) * 100) : 0,
      },
      inventory: inventory.map((item) => ({
        ...item.toJSON(),
        shortage: Math.max(0, item.required - item.current),
      })),
    });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    if (!req.body.name) throw new AppError('Camp name is required', 400);
    const camp = await createCamp(req.body, req.user, req.ip);
    res.status(201).json({ success: true, camp });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const camp = await updateCamp(req.params.id, req.body, req.user, req.ip);
    res.json({ success: true, camp });
  } catch (error) {
    next(error);
  }
}

async function population(req, res, next) {
  try {
    const camp = await ReliefCamp.findById(req.params.id);
    if (!camp) throw new AppError('Relief camp not found', 404);
    const [people, unregistered] = await Promise.all([
      Citizen.find({ currentCamp: camp._id })
        .select('+specialAssistanceNotes fullName registrationId disasterStatus gender dateOfBirth isVulnerable vulnerabilityTypes statusUpdatedAt lastKnownLocation currentCondition')
        .sort({ statusUpdatedAt: -1 }),
      UnregisteredPerson.find({ currentCamp: camp._id }).sort({ createdAt: -1 }),
    ]);
    res.json({ success: true, camp, people, unregistered });
  } catch (error) {
    next(error);
  }
}

module.exports = { listCamps, campDetails, create, update, population };
