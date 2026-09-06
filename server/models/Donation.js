const mongoose = require('mongoose');
const { INVENTORY_ITEMS, DONATION_STATUS } = require('../utils/constants');

const donationSchema = new mongoose.Schema(
  {
    donationId: { type: String, required: true, unique: true },
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, default: '', lowercase: true },
    donorPhone: { type: String, default: '' },
    donorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorType: { type: String, default: 'Individual' },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    reliefRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefRequest' },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.PLEDGED,
      index: true,
    },
    notes: { type: String, default: '' },
    pledgedQuantity: { type: Number, default: 0 },
    receivedQuantity: { type: Number, default: 0 },
    receivedAt: { type: Date },
    distributedAt: { type: Date },
    inventoryUpdated: { type: Boolean, default: false },
    excessOverride: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
