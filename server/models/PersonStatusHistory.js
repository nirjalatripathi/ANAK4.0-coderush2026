const mongoose = require('mongoose');
const { PERSON_STATUS } = require('../utils/constants');

const personStatusHistorySchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', index: true },
    unregisteredPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'UnregisteredPerson', index: true },
    previousStatus: { type: String, enum: Object.values(PERSON_STATUS) },
    newStatus: { type: String, enum: Object.values(PERSON_STATUS), required: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    official: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    officialId: { type: String, default: '' },
    location: { type: String, default: '' },
    notes: { type: String, default: '' },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('PersonStatusHistory', personStatusHistorySchema);
