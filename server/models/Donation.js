const mongoose = require('mongoose');
const { INVENTORY_ITEMS, DONATION_STATUS } = require('../utils/constants');

const eventSchema = new mongoose.Schema(
  {
    key: { type: String, required: true },
    label: { type: String, required: true },
    at: { type: Date, default: Date.now },
    description: { type: String, default: '' },
    byName: { type: String, default: '' },
  },
  { _id: false }
);

const donationSchema = new mongoose.Schema(
  {
    donationId: { type: String, required: true, unique: true },
    kind: { type: String, enum: ['Money', 'Physical'], default: 'Physical', index: true },
    donorName: { type: String, required: true, trim: true },
    donorEmail: { type: String, default: '', lowercase: true },
    donorPhone: { type: String, default: '' },
    donorUser: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    donorType: { type: String, default: 'Individual' },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', index: true },
    reliefNeed: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefNeed' },
    reliefRequest: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefRequest' },
    victim: { type: mongoose.Schema.Types.ObjectId, ref: 'VictimApplication', index: true },
    paymentProvider: { type: String, default: '' },
    khaltiPidx: { type: String, default: '', index: true },
    khaltiTxnId: { type: String, default: '' },
    purchaseOrderId: { type: String, default: '', index: true },
    esewaUuid: { type: String, default: '' },
    esewaRefId: { type: String, default: '' },
    paymentStatus: {
      type: String,
      enum: ['INITIATED', 'PENDING', 'COMPLETE', 'FAILED', 'CANCELED', 'AMBIGUOUS', 'NOT_FOUND', 'UNAVAILABLE', 'FULL_REFUND', 'PARTIAL_REFUND'],
      default: 'INITIATED',
      index: true,
    },
    itemName: { type: String, enum: [...INVENTORY_ITEMS, ''], default: '' },
    category: { type: String, default: '' },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: '' },
    amountNPR: { type: Number, default: 0, min: 0 },
    allocatedAmount: { type: Number, default: 0 },
    usedAmount: { type: Number, default: 0 },
    remainingAmount: { type: Number, default: 0 },
    purpose: { type: String, default: '' },
    message: { type: String, default: '' },
    condition: { type: String, default: '' },
    availableDate: { type: Date },
    deliveryMethod: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(DONATION_STATUS),
      default: DONATION_STATUS.PENDING,
      index: true,
    },
    notes: { type: String, default: '' },
    pledgedQuantity: { type: Number, default: 0 },
    receivedQuantity: { type: Number, default: 0 },
    receivedAt: { type: Date },
    distributedAt: { type: Date },
    inventoryUpdated: { type: Boolean, default: false },
    excessOverride: { type: Boolean, default: false },
    peopleSupported: { type: Number, default: 0 },
    timeline: { type: [eventSchema], default: [] },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Donation', donationSchema);
