const mongoose = require('mongoose');

const campOfficialSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    officialId: { type: String, required: true, unique: true },
    fullName: { type: String, required: true, trim: true },
    assignedCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true, index: true },
    phone: { type: String, default: '' },
    designation: { type: String, default: 'Camp Official' },
    isActive: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CampOfficial', campOfficialSchema);
