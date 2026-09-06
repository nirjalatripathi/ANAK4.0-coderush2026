const mongoose = require('mongoose');

const donationAllocationSchema = new mongoose.Schema(
  {
    allocationId: { type: String, required: true, unique: true },
    donation: { type: mongoose.Schema.Types.ObjectId, ref: 'Donation', required: true, index: true },
    need: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefNeed' },
    camp: { type: mongoose.Schema.Types.ObjectId, ref: 'ReliefCamp' },
    itemName: { type: String, default: '' },
    amountNPR: { type: Number, default: 0 },
    quantity: { type: Number, default: 0 },
    reason: { type: String, default: '' },
    allocatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('DonationAllocation', donationAllocationSchema);
