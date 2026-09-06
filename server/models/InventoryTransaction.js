const mongoose = require('mongoose');
const { INVENTORY_ITEMS, INVENTORY_TXN_TYPES } = require('../utils/constants');

const inventoryTransactionSchema = new mongoose.Schema(
  {
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    itemName: { type: String, enum: INVENTORY_ITEMS, required: true },
    quantity: { type: Number, required: true },
    type: { type: String, enum: Object.values(INVENTORY_TXN_TYPES), required: true },
    source: { type: String, default: '' },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation' },
    transfer: { type: mongoose.Schema.Types.ObjectId, ref: 'ResourceTransfer' },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('InventoryTransaction', inventoryTransactionSchema);
