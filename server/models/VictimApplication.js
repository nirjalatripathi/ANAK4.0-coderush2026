const mongoose = require('mongoose');

const VICTIM_STATUS = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  FULFILLED: 'Fulfilled',
  CLOSED: 'Closed',
};

const victimApplicationSchema = new mongoose.Schema(
  {
    applicationId: { type: String, required: true, unique: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    fullName: { type: String, required: true, trim: true },
    displayName: { type: String, required: true, trim: true },
    phone: { type: String, default: '', select: false },
    email: { type: String, default: '', lowercase: true, select: false },
    district: { type: String, required: true, trim: true },
    municipality: { type: String, required: true, trim: true },
    ward: { type: String, default: '' },
    householdSize: { type: Number, default: 1, min: 1 },
    category: {
      type: String,
      enum: ['Medical', 'Shelter', 'Food', 'Livelihood', 'Education', 'Other'],
      default: 'Other',
    },
    story: { type: String, required: true, trim: true },
    amountNeededNPR: { type: Number, required: true, min: 100 },
    amountRaisedNPR: { type: Number, default: 0, min: 0 },
    photoUrl: { type: String, default: '/rahat-motive.jpg' },
    evidenceUrl: { type: String, default: '' },
    evidenceOriginalName: { type: String, default: '' },
    evidenceMimeType: { type: String, default: '' },
    additionalPhone: { type: String, default: '', select: false },
    additionalEmail: { type: String, default: '', lowercase: true, select: false },
    status: {
      type: String,
      enum: Object.values(VICTIM_STATUS),
      default: VICTIM_STATUS.PENDING,
      index: true,
    },
    isPublic: { type: Boolean, default: false, index: true },
    reviewNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

victimApplicationSchema.virtual('remainingNPR').get(function remainingNPR() {
  return Math.max(0, (this.amountNeededNPR || 0) - (this.amountRaisedNPR || 0));
});

victimApplicationSchema.virtual('percentRaised').get(function percentRaised() {
  if (!this.amountNeededNPR) return 0;
  return Math.min(100, Math.round((this.amountRaisedNPR / this.amountNeededNPR) * 100));
});

victimApplicationSchema.set('toJSON', { virtuals: true });
victimApplicationSchema.set('toObject', { virtuals: true });

victimApplicationSchema.statics.VICTIM_STATUS = VICTIM_STATUS;

module.exports = mongoose.model('VictimApplication', victimApplicationSchema);
module.exports.VICTIM_STATUS = VICTIM_STATUS;
