const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../utils/constants');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    audience: { type: String, enum: ['user', 'role', 'all'], default: 'user' },
    role: { type: String, default: '' },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, default: 'system' },
    isRead: { type: Boolean, default: false },
    relatedModel: { type: String, default: '' },
    relatedId: { type: mongoose.Schema.Types.ObjectId },
  },
  { timestamps: true }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
