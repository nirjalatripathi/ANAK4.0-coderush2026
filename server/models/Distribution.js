const mongoose = require('mongoose');
const { INVENTORY_ITEMS } = require('../utils/constants');

const distributionSchema = new mongoose.Schema(
  {
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    recipientGroup: { type: String, default: '' },
    householdCount: { type: Number, default: 0 },
    personCount: { type: Number, default: 0 },
    official: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    distributedAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Distribution', distributionSchema);
