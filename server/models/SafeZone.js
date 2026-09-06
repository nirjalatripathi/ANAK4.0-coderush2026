const mongoose = require('mongoose');
const { DISASTER_TYPES, SAFE_ZONE_STATUS, SAFE_ZONE_FACILITIES } = require('../utils/constants');

const safeZoneSchema = new mongoose.Schema(
  {
    safeZoneId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    localGovernment: { type: mongoose.Schema.Types.ObjectId, ref: 'LocalGovernment' },
    municipality: { type: String, default: '' },
    district: { type: String, default: '' },
    ward: { type: String, default: '' },
    location: { type: String, default: '' },
    latitude: { type: Number },
    longitude: { type: Number },
    capacity: { type: Number, default: 0, min: 0 },
    currentOccupancy: { type: Number, default: 0, min: 0 },
    accessibleFor: { type: String, default: '' },
    facilities: [{ type: String, enum: SAFE_ZONE_FACILITIES }],
    hazards: { type: String, default: '' },
    suitableDisasterTypes: [{ type: String, enum: DISASTER_TYPES }],
    minimumDisasterLevel: { type: Number, default: 1, min: 1, max: 4 },
    maximumDisasterLevel: { type: Number, default: 4, min: 1, max: 4 },
    status: {
      type: String,
      enum: Object.values(SAFE_ZONE_STATUS),
      default: SAFE_ZONE_STATUS.PROPOSED,
      index: true,
    },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    assignedWards: [{ type: String }],
    declaredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    declaredAt: { type: Date },
    notes: { type: String, default: '' },
    isPublic: { type: Boolean, default: false },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

safeZoneSchema.virtual('available').get(function available() {
  return Math.max(0, (this.capacity || 0) - (this.currentOccupancy || 0));
});

safeZoneSchema.virtual('occupancyPercent').get(function occupancyPercent() {
  if (!this.capacity) return 0;
  return Math.round((this.currentOccupancy / this.capacity) * 1000) / 10;
});

safeZoneSchema.set('toJSON', { virtuals: true });
safeZoneSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SafeZone', safeZoneSchema);
