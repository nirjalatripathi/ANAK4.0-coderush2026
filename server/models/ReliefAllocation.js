const mongoose = require('mongoose');
const { INVENTORY_ITEMS } = require('../utils/constants');

const lineSchema = new mongoose.Schema(
  {
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    quantity: { type: Number, default: 0 },
    reason: { type: String, default: '' },
  },
  { _id: false }
);

const reliefAllocationSchema = new mongoose.Schema(
  {
    allocationId: { type: String, required: true, unique: true },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    availableQuantity: { type: Number, required: true },
    lines: [lineSchema],
    status: { type: String, enum: ['Recommended', 'Confirmed', 'Cancelled'], default: 'Recommended' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReliefAllocation', reliefAllocationSchema);
