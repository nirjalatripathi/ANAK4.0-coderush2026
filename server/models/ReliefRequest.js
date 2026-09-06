const mongoose = require('mongoose');
const { INVENTORY_ITEMS, PRIORITY } = require('../utils/constants');

const reliefRequestSchema = new mongoose.Schema(
  {
    requestId: { type: String, required: true, unique: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    current: { type: Number, default: 0 },
    required: { type: Number, default: 0 },
    incoming: { type: Number, default: 0 },
    dailyConsumption: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
    notes: { type: String, default: '' },
    status: { type: String, enum: ['Draft', 'Submitted', 'Verified', 'Fulfilled', 'Cancelled'], default: 'Submitted' },
    priority: { type: String, enum: Object.values(PRIORITY), default: PRIORITY.MEDIUM },
    priorityReason: { type: String, default: '' },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ReliefRequest', reliefRequestSchema);
