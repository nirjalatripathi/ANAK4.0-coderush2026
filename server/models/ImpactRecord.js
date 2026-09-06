const mongoose = require('mongoose');

const impactRecordSchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    itemName: { type: String, default: '' },
    amountUsedNPR: { type: Number, default: 0 },
    quantityDelivered: { type: Number, default: 0 },
    unit: { type: String, default: '' },
    peopleSupported: { type: Number, default: 0 },
    location: { type: String, default: '' },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    notes: { type: String, default: '' },
    donorFacing: { type: Boolean, default: true },
    proofs: [{
      kind: { type: String, default: 'photo' },
      url: { type: String, default: '' },
      caption: { type: String, default: '' },
      donorFacing: { type: Boolean, default: true },
    }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('ImpactRecord', impactRecordSchema);
