const mongoose = require('mongoose');
const {
  GENDERS,
  BLOOD_GROUPS,
  VERIFICATION_STATUS,
  PERSON_STATUS,
  VULNERABILITY_TYPES,
  RELATIONSHIPS,
} = require('../utils/constants');

const addressSchema = new mongoose.Schema(
  {
    street: { type: String, default: '' },
    district: { type: String, default: '' },
    municipality: { type: String, default: '' },
    ward: { type: String, default: '' },
  },
  { _id: false }
);

const emergencyContactSchema = new mongoose.Schema(
  {
    name: { type: String, default: '' },
    phone: { type: String, default: '' },
    relationship: { type: String, default: '' },
  },
  { _id: false }
);

const citizenSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    registrationId: { type: String, required: true, unique: true, index: true },
    fullName: { type: String, required: true, trim: true, index: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: GENDERS, required: true },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, default: 'Unknown' },
    phone: { type: String, default: '', index: true },
    email: { type: String, default: '', lowercase: true },
    permanentAddress: { type: addressSchema, default: () => ({}) },
    currentAddress: { type: addressSchema, default: () => ({}) },
    emergencyContact: { type: emergencyContactSchema, default: () => ({}) },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household', index: true },
    relationshipToHead: { type: String, enum: [...RELATIONSHIPS, 'Head of Household', ''], default: '' },
    nationalId: { type: String, default: '', select: false },
    citizenshipNumber: { type: String, default: '', select: false },
    photoUrl: { type: String, default: '' },
    verificationStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
      index: true,
    },
    verificationNotes: { type: String, default: '' },
    verifiedAt: { type: Date },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    disasterStatus: {
      type: String,
      enum: Object.values(PERSON_STATUS),
      default: PERSON_STATUS.UNVERIFIED,
      index: true,
    },
    currentCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    currentSafeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone' },
    lastKnownLocation: { type: String, default: '' },
    currentCondition: { type: String, default: '' },
    statusUpdatedAt: { type: Date },
    isVulnerable: { type: Boolean, default: false },
    vulnerabilityTypes: [{ type: String, enum: VULNERABILITY_TYPES }],
    specialAssistanceNotes: { type: String, default: '', select: false },
    isSuspended: { type: Boolean, default: false },
    isPublicMissingApproved: { type: Boolean, default: false },
    publicDisplayName: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

citizenSchema.index({ fullName: 'text' });
citizenSchema.index({ 'permanentAddress.district': 1 });
citizenSchema.index({ disasterStatus: 1, currentCamp: 1 });

module.exports = mongoose.model('Citizen', citizenSchema);
