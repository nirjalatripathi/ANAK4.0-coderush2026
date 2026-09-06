const mongoose = require('mongoose');
const { INVENTORY_ITEMS, PRIORITY } = require('../utils/constants');

const campInventorySchema = new mongoose.Schema(
  {
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    current: { type: Number, default: 0, min: 0 },
    required: { type: Number, default: 0, min: 0 },
    incoming: { type: Number, default: 0, min: 0 },
    distributed: { type: Number, default: 0, min: 0 },
    dailyConsumption: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'units' },
    priority: { type: String, enum: Object.values(PRIORITY), default: PRIORITY.MEDIUM },
    priorityReason: { type: String, default: '' },
    lastUpdatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

campInventorySchema.index({ camp: 1, itemName: 1 }, { unique: true });

campInventorySchema.virtual('shortage').get(function shortage() {
  return Math.max(0, (this.required || 0) - (this.current || 0));
});

campInventorySchema.methods.recalculatePriority = function recalculatePriority() {
  const shortage = Math.max(0, (this.required || 0) - (this.current || 0));
  const ratio = this.required ? shortage / this.required : 0;
  if (this.required === 0) {
    this.priority = PRIORITY.LOW;
  } else if (ratio >= 0.7 || (this.current === 0 && this.required > 0)) {
    this.priority = PRIORITY.CRITICAL;
  } else if (ratio >= 0.4) {
    this.priority = PRIORITY.HIGH;
  } else if (ratio > 0) {
    this.priority = PRIORITY.MEDIUM;
  } else {
    this.priority = PRIORITY.LOW;
  }
};

campInventorySchema.set('toJSON', { virtuals: true });
campInventorySchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('CampInventory', campInventorySchema);
