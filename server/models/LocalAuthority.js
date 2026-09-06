const mongoose = require('mongoose');

const localAuthoritySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    title: { type: String, default: 'Local Disaster Management Officer' },
    province: { type: String, default: 'Bagmati' },
    district: { type: String, required: true, index: true },
    municipality: { type: String, required: true, index: true },
    wards: [{ type: String }],
    contactPhone: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('LocalAuthority', localAuthoritySchema);
