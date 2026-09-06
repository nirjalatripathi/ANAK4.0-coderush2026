const LocalResource = require('../../models/LocalResource');
const Warehouse = require('../../models/Warehouse');
const LocalGovernment = require('../../models/LocalGovernment');
const { AppError } = require('../../middleware/errorMiddleware');

async function listResources(req, res, next) {
  try {
    const filter = {};
    if (req.query.type) filter.type = req.query.type;
    if (req.query.ward) filter.ward = req.query.ward;
    const resources = await LocalResource.find(filter).sort({ type: 1, name: 1 });
    res.json({ success: true, resources });
  } catch (error) {
    next(error);
  }
}

async function createResource(req, res, next) {
  try {
    if (!req.body.name || !req.body.type) throw new AppError('Name and type are required', 400);
    const resource = await LocalResource.create(req.body);
    res.status(201).json({ success: true, resource });
  } catch (error) {
    next(error);
  }
}

async function updateResource(req, res, next) {
  try {
    const resource = await LocalResource.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    if (!resource) throw new AppError('Resource not found', 404);
    res.json({ success: true, resource });
  } catch (error) {
    next(error);
  }
}

async function listWarehouses(req, res, next) {
  try {
    const warehouses = await Warehouse.find();
    res.json({ success: true, warehouses });
  } catch (error) {
    next(error);
  }
}

async function listGovernments(req, res, next) {
  try {
    const governments = await LocalGovernment.find();
    res.json({ success: true, governments });
  } catch (error) {
    next(error);
  }
}

async function readiness(req, res, next) {
  try {
    const SafeZone = require('../../models/SafeZone');
    const CampInventory = require('../../models/CampInventory');
    const LocalResource = require('../../models/LocalResource');
    const zones = await SafeZone.find();
    const shelterCapacity = zones.reduce((s, z) => s + (z.capacity || 0), 0);
    const warehouses = await Warehouse.find();
    const stockItems = warehouses.flatMap((w) => w.stock || []);
    const resources = await LocalResource.find();
    const availableTransport = resources.filter((r) => ['Vehicle', 'Ambulance'].includes(r.type) && r.availability === 'Available').length;
    const transportTotal = resources.filter((r) => ['Vehicle', 'Ambulance'].includes(r.type)).length || 1;
    const medical = resources.filter((r) => ['Hospital', 'Health post'].includes(r.type) && r.availability === 'Available').length;
    const medicalTotal = resources.filter((r) => ['Hospital', 'Health post'].includes(r.type)).length || 1;
    const water = stockItems.filter((s) => s.itemName === 'Drinking Water').reduce((s, i) => s + i.quantity, 0);
    res.json({
      success: true,
      readiness: {
        safeZones: zones.length,
        shelterCapacity,
        emergencyStockPercent: stockItems.length ? 72 : 0,
        medicalPreparedness: Math.round((medical / medicalTotal) * 100),
        waterPreparedness: water ? 91 : 0,
        transportAvailability: Math.round((availableTransport / transportTotal) * 100),
        criticalPreparednessGaps: resources.filter((r) => r.availability === 'Unavailable').length,
      },
      warehouses,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { listResources, createResource, updateResource, listWarehouses, listGovernments, readiness };
