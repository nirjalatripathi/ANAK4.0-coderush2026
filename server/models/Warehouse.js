const mongoose = require('mongoose');
const { INVENTORY_ITEMS } = require('../utils/constants');

const stockSchema = new mongoose.Schema(
  {
    itemName: { type: String, enum: INVENTORY_ITEMS },
    quantity: { type: Number, default: 0 },
    unit: { type: String, default: 'units' },
  },
  { _id: false }
);

const warehouseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
    location: { type: String, default: '' },
    stock: [stockSchema],
    prePositioned: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
