const mongoose = require('mongoose');
const { GENDERS, UNREGISTERED_STATUS, PERSON_STATUS } = require('../utils/constants');

const unregisteredPersonSchema = new mongoose.Schema(
  {
    temporaryId: { type: String, required: true, unique: true, index: true },
    name: { type: String, default: 'Unknown', trim: true },
    approximateAge: { type: String, default: '' },
    gender: { type: String, enum: [...GENDERS, 'Unknown'], default: 'Unknown' },
    photoUrl: { type: String, default: '' },
    currentLocation: { type: String, default: '' },
    previousLocation: { type: String, default: '' },
    countryOfOrigin: { type: String, default: '' },
    districtOfOrigin: { type: String, default: '' },
    familyInformation: { type: String, default: '' },
    emergencyContact: {
      name: { type: String, default: '' },
      phone: { type: String, default: '' },
    },
    availableId: { type: String, default: '' },
    status: {
      type: String,
      enum: Object.values(UNREGISTERED_STATUS),
      default: UNREGISTERED_STATUS.UNVERIFIED,
      index: true,
    },
    disasterStatus: {
      type: String,
      enum: Object.values(PERSON_STATUS),
      default: PERSON_STATUS.UNVERIFIED,
    },
    currentCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    matchedCitizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    matchedHousehold: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    problems: { type: String, default: '' },
    notes: { type: String, default: '' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('UnregisteredPerson', unregisteredPersonSchema);
