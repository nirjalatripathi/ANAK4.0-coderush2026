const mongoose = require('mongoose');
const { RELATIONSHIPS } = require('../utils/constants');

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: '' },
    district: { type: String, default: '' },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
  },
  { _id: false }
);

const memberSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
    relationship: { type: String, enum: [...RELATIONSHIPS, 'Head of Household'], required: true },
  },
  { _id: false }
);

const householdSchema = new mongoose.Schema(
  {
    householdId: { type: String, required: true, unique: true, index: true },
    headOfHousehold: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true },
    permanentAddress: { type: addressSchema, default: () => ({}) },
    currentAddress: { type: addressSchema, default: () => ({}) },
    members: [memberSchema],
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
      relationship: { type: String, default: '' },
    },
    memberCount: { type: Number, default: 1 },
    evacuationStatus: {
      type: String,
      enum: ['At Home', 'Evacuated', 'In Safe Zone', 'In Relief Camp', 'Separated', 'Recovered'],
      default: 'At Home',
    },
    currentSafeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone' },
    currentCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

householdSchema.methods.syncMemberCount = function syncMemberCount() {
  this.memberCount = this.members.length;
};

module.exports = mongoose.model('Household', householdSchema);
