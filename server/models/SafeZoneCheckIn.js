const mongoose = require('mongoose');

const safeZoneCheckInSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    unregisteredPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'UnregisteredPerson' },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    safeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone', required: true, index: true },
    disaster: { type: mongoose.Schema.Types.ObjectId, ref: 'Disaster' },
    familyMembersCount: { type: Number, default: 1, min: 1 },
    specialNeeds: { type: String, default: '' },
    currentCondition: { type: String, default: '' },
    status: { type: String, enum: ['Present', 'Transferred', 'Checked Out'], default: 'Present', index: true },
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    checkedInAt: { type: Date, default: Date.now },
    checkedOutAt: { type: Date },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

safeZoneCheckInSchema.index({ citizen: 1, status: 1 });

module.exports = mongoose.model('SafeZoneCheckIn', safeZoneCheckInSchema);
