const mongoose = require('mongoose');
const { INVENTORY_ITEMS, SHIPMENT_STATUS } = require('../utils/constants');

const shipmentSchema = new mongoose.Schema(
  {
    shipmentId: { type: String, required: true, unique: true, index: true },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    quantity: { type: Number, required: true, min: 1 },
    dispatchedQuantity: { type: Number, default: 0 },
    receivedQuantity: { type: Number, default: 0 },
    damagedQuantity: { type: Number, default: 0 },
    missingQuantity: { type: Number, default: 0 },
    origin: { type: String, default: '' },
    destination: { type: String, default: '' },
    transportType: { type: String, default: '' },
    carrier: { type: String, default: '' },
    dispatchDate: { type: Date },
    expectedArrival: { type: Date },
    actualArrival: { type: Date },
    status: {
      type: String,
      enum: Object.values(SHIPMENT_STATUS),
      default: SHIPMENT_STATUS.PREPARED,
      index: true,
    },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Shipment', shipmentSchema);
