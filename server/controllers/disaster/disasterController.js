const Disaster = require('../../models/Disaster');
const { listPublicDisasters, listAllDisasters, getActiveDisasters, createDisaster, updateDisaster } = require('../../services/disasterService');
const { AppError } = require('../../middleware/errorMiddleware');

async function list(req, res, next) {
  try {
    const disasters = await listPublicDisasters();
    res.json({ success: true, disasters });
  } catch (error) {
    next(error);
  }
}

async function adminList(req, res, next) {
  try {
    const disasters = await listAllDisasters();
    res.json({ success: true, disasters });
  } catch (error) {
    next(error);
  }
}

async function active(req, res, next) {
  try {
    const disasters = await getActiveDisasters();
    res.json({ success: true, disasters, disasterMode: disasters.length > 0 });
  } catch (error) {
    next(error);
  }
}

async function details(req, res, next) {
  try {
    const disaster = await Disaster.findById(req.params.id).populate('activeCamps');
    if (!disaster) throw new AppError('Disaster not found', 404);
    res.json({ success: true, disaster });
  } catch (error) {
    next(error);
  }
}

async function create(req, res, next) {
  try {
    const disaster = await createDisaster(req.body, req.user, req.ip);
    res.status(201).json({ success: true, disaster });
  } catch (error) {
    next(error);
  }
}

async function update(req, res, next) {
  try {
    const disaster = await updateDisaster(req.params.id, req.body, req.user, req.ip);
    res.json({ success: true, disaster });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, adminList, active, details, create, update };
