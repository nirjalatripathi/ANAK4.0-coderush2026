const mongoose = require('mongoose');

const donationDeliverySchema = new mongoose.Schema(
  {
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp', required: true },
    expectedQuantity: { type: Number, required: true },
    receivedQuantity: { type: Number, required: true },
    discrepancy: { type: Number, default: 0 },
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String, default: '' },
    isDemo: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationDelivery', donationDeliverySchema);
