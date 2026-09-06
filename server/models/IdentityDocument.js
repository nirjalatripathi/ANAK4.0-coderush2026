const mongoose = require('mongoose');
const { DOCUMENT_TYPES, VERIFICATION_STATUS } = require('../utils/constants');

const identityDocumentSchema = new mongoose.Schema(
  {
    citizen: { type: mongoose.Schema.Types.ObjectId, ref: 'Citizen', required: true, index: true },
    documentType: { type: String, enum: Object.values(DOCUMENT_TYPES), required: true },
    filePath: { type: String, required: true },
    originalName: { type: String, default: '' },
    mimeType: { type: String, default: '' },
    reviewStatus: {
      type: String,
      enum: Object.values(VERIFICATION_STATUS),
      default: VERIFICATION_STATUS.PENDING,
    },
    reviewNotes: { type: String, default: '' },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('IdentityDocument', identityDocumentSchema);
