const mongoose = require('mongoose');
const { DISASTER_TYPES, DISASTER_STATUS, DISASTER_SEVERITY } = require('../utils/constants');

const disasterSchema = new mongoose.Schema(
  {
    disasterId: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: DISASTER_TYPES, required: true },
    location: { type: String, default: '' },
    district: { type: String, default: '' },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
    date: { type: Date, required: true },
    severity: { type: String, enum: DISASTER_SEVERITY, default: 'Moderate' },
    description: { type: String, default: '' },
    affectedAreas: [{ type: String }],
    affectedWards: [{ type: String }],
    expectedPopulation: { type: Number, default: 0 },
    evacuationRequired: { type: Boolean, default: true },
    disasterLevel: { type: Number, default: 2, min: 1, max: 4, index: true },
    responsePriorities: [{ type: String }],
    localGovernment: { type: mongoose.Schema.Types.ObjectId, ref: 'LocalGovernment' },
    latitude: { type: Number },
    longitude: { type: Number },
    activeCamps: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' }],
    activeSafeZones: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone' }],
    status: {
      type: String,
      enum: Object.values(DISASTER_STATUS),
      default: DISASTER_STATUS.MONITORING,
      index: true,
    },
    isPublic: { type: Boolean, default: true },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Disaster', disasterSchema);
