const mongoose = require('mongoose');

const localGovernmentSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    type: { type: String, enum: ['Gaunpalika', 'Nagarpalika', 'Metropolitan', 'Sub-Metropolitan'], default: 'Nagarpalika' },
    province: { type: String, default: 'Bagmati' },
    district: { type: String, required: true },
    wards: [{ type: String }],
    settlements: [{ type: String }],
    contactPhone: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LocalGovernment', localGovernmentSchema);
