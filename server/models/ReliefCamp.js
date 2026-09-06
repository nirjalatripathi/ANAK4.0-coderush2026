const mongoose = require('mongoose');
const { CAMP_RESOURCE_STATUS, CAMP_STATUS } = require('../utils/constants');

const reliefCampSchema = new mongoose.Schema(
  {
    campId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    location: { type: String, default: '' },
    district: { type: String, default: '' },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
    campHead: { type: String, default: '' },
    contactPhone: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    capacity: { type: Number, default: 0 },
    currentPopulation: { type: Number, default: 0 },
    beds: { type: Number, default: 0 },
    medicalStatus: { type: String, enum: CAMP_RESOURCE_STATUS, default: 'Adequate' },
    foodStatus: { type: String, enum: CAMP_RESOURCE_STATUS, default: 'Adequate' },
    waterStatus: { type: String, enum: CAMP_RESOURCE_STATUS, default: 'Adequate' },
    sanitationStatus: { type: String, enum: CAMP_RESOURCE_STATUS, default: 'Adequate' },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    localGovernment: { type: mongoose.Schema.Types.ObjectId, ref: 'LocalGovernment' },
    latitude: { type: Number },
    longitude: { type: Number },
    campStatus: { type: String, enum: Object.values(CAMP_STATUS), default: CAMP_STATUS.ACTIVE },
    isActive: { type: Boolean, default: true, index: true },
    isDemo: { type: Boolean, default: false },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

reliefCampSchema.virtual('occupancyPercent').get(function occupancyPercent() {
  if (!this.capacity) return 0;
  return Math.round((this.currentPopulation / this.capacity) * 100);
});

reliefCampSchema.set('toJSON', { virtuals: true });
reliefCampSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('ReliefCamp', reliefCampSchema);
