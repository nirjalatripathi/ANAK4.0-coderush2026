const mongoose = require('mongoose');
const { INVENTORY_ITEMS, RESOURCE_TRANSFER_STATUS } = require('../utils/constants');

const resourceTransferSchema = new mongoose.Schema(
  {
    transferId: { type: String, required: true, unique: true, index: true },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    sourceCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    destinationCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    reason: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(RESOURCE_TRANSFER_STATUS),
      default: RESOURCE_TRANSFER_STATUS.PROPOSED,
      index: true,
    },
    recommended: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ResourceTransfer', resourceTransferSchema);
