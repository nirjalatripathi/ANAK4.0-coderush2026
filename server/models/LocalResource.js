const mongoose = require('mongoose');
const { LOCAL_RESOURCE_TYPES, RESOURCE_AVAILABILITY } = require('../utils/constants');

const localResourceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, enum: LOCAL_RESOURCE_TYPES, required: true },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
    location: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    availability: { type: String, enum: RESOURCE_AVAILABILITY, default: 'Available' },
    notes: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LocalResource', localResourceSchema);
