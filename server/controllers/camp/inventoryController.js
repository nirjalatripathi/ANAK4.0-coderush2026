const CampInventory = require('../../models/CampInventory');
const ReliefNeed = require('../../models/ReliefNeed');
const { updateInventoryItem, syncReliefNeeds, assertOfficialCampAccess } = require('../../services/campService');
const { decorateInventory } = require('../../services/reliefEngine');
const { AppError } = require('../../middleware/errorMiddleware');

async function listInventory(req, res, next) {
  try {
    const campId = req.params.campId || req.query.campId;
    if (!campId) throw new AppError('Camp is required', 400);
    if (req.user.role === 'camp_official') {
      assertOfficialCampAccess(req.user, campId);
    }
    const items = await CampInventory.find({ camp: campId }).populate('camp', 'name campId');
    res.json({
      success: true,
      items: items.map((item) => decorateInventory(item)),
    });
  } catch (error) {
    next(error);
  }
}

async function updateItem(req, res, next) {
  try {
    const campId = req.params.campId || req.body.campId;
    if (!campId || !req.body.itemName) throw new AppError('Camp and item name are required', 400);
    if (req.user.role === 'camp_official') {
      assertOfficialCampAccess(req.user, campId);
    }
    const item = await updateInventoryItem({
      campId,
      itemName: req.body.itemName,
      updates: req.body,
      user: req.user,
      ip: req.ip,
    });
    res.json({
      success: true,
      item: { ...item.toJSON(), shortage: Math.max(0, item.required - item.current) },
    });
  } catch (error) {
    next(error);
  }
}

async function listNeeds(req, res, next) {
  try {
    const filter = { isPublished: true };
    if (req.query.campId) filter.camp = req.query.campId;
    if (req.query.priority) filter.priority = req.query.priority;
    const needs = await ReliefNeed.find(filter).populate('camp', 'name campId district').sort({ priority: 1, shortage: -1 });
    const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    needs.sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9) || b.shortage - a.shortage);
    res.json({ success: true, needs });
  } catch (error) {
    next(error);
  }
}

async function refreshNeeds(req, res, next) {
  try {
    const campId = req.params.campId || req.body.campId;
    if (!campId) throw new AppError('Camp is required', 400);
    const needs = await syncReliefNeeds(campId);
    res.json({ success: true, needs });
  } catch (error) {
    next(error);
  }
}

module.exports = { listInventory, updateItem, listNeeds, refreshNeeds };
