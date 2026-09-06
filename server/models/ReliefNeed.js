const mongoose = require('mongoose');
const { INVENTORY_ITEMS, PRIORITY } = require('../utils/constants');

const reliefNeedSchema = new mongoose.Schema(
  {
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    inventory: { type: mongoose.Schema.Types.ObjectId, ref: 'CampInventory' },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    available: { type: Number, default: 0 },
    required: { type: Number, default: 0 },
    shortage: { type: Number, default: 0 },
    projectedShortage: { type: Number, default: 0 },
    daysOfSupply: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    priority: { type: String, enum: Object.values(PRIORITY), default: PRIORITY.MEDIUM },
    priorityReason: { type: String, default: '' },
    isPublished: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReliefNeed', reliefNeedSchema);
