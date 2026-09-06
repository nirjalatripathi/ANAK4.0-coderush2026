const mongoose = require('mongoose');

const affectedAreaSchema = new mongoose.Schema(
  {
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster', required: true, index: true },
    province: { type: String, default: '' },
    district: { type: String, default: '', index: true },
    municipality: { type: String, default: '', index: true },
    ward: { type: String, default: '', index: true },
    community: { type: String, default: '' },
    estimatedPopulation: { type: Number, default: 0 },
    estimatedAffected: { type: Number, default: 0 },
    impactLevel: { type: String, default: 'High' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

affectedAreaSchema.index({ disaster: 1, ward: 1 });

module.exports = mongoose.model('AffectedArea', affectedAreaSchema);
