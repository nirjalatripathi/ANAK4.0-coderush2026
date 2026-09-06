const mongoose = require('mongoose');
const { EMERGENCY_URGENCY, EMERGENCY_STATUS, REPORTER_TYPES } = require('../utils/constants');

const emergencyReportSchema = new mongoose.Schema(
  {
    reportId: { type: String, required: true, unique: true },
    reporterType: { type: String, enum: REPORTER_TYPES, required: true },
    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reporterName: { type: String, default: '' },
    reporterPhone: { type: String, default: '' },
    onBehalfOfCitizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    onBehalfOfUnregistered: { type: mongoose.Schema.Types.ObjectId, ref: 'UnregisteredPerson' },
    onBehalfOfName: { type: String, default: '' },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    location: { type: String, default: '' },
    district: { type: String, default: '' },
    description: { type: String, required: true },
    urgency: { type: String, enum: EMERGENCY_URGENCY, default: 'High' },
    status: {
      type: String,
      enum: Object.values(EMERGENCY_STATUS),
      default: EMERGENCY_STATUS.OPEN,
      index: true,
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    resolutionNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmergencyReport', emergencyReportSchema);
