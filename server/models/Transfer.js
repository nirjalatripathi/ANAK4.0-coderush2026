const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen' },
    unregisteredPerson: { type: mongoose.Schema.Types.ObjectId, ref: 'UnregisteredPerson' },
    household: { type: mongoose.Schema.Types.ObjectId, ref: 'Household' },
    fromSafeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone' },
    fromCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    toSafeZone: { type: mongoose.Schema.Types.ObjectId, ref: 'SafeZone' },
    toCamp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    reason: { type: String, default: '' },
    transport: { type: String, default: '' },
    official: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['Authorized', 'In Transit', 'Arrived', 'Cancelled'], default: 'Arrived' },
    transferredAt: { type: Date, default: Date.now },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Transfer', transferSchema);
