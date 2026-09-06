const Notification = require('../models/Notification');

async function createNotification({ user, audience = 'user', role, title, body, type = 'system', relatedModel, relatedId }) {
  return Notification.create({
    user: user || null,
    audience,
    role: role || '',
    title,
    body,
    type,
    relatedModel: relatedModel || '',
    relatedId: relatedId || undefined,
  });
}

async function notifyMany(users, payload) {
  if (!users?.length) return [];
  const docs = users.map((user) => ({
    user,
    audience: 'user',
    title: payload.title,
    body: payload.body,
    type: payload.type || 'system',
    relatedModel: payload.relatedModel || '',
    relatedId: payload.relatedId,
  }));
  return Notification.insertMany(docs);
}

async function listForUser(user, { unreadOnly = false } = {}) {
  const filter = {
    $or: [
      { user: user._id },
      { audience: 'all' },
      { audience: 'role', role: user.role },
    ],
  };
  if (unreadOnly) filter.isRead = false;
  return Notification.find(filter).sort({ createdAt: -1 }).limit(80);
}

async function markRead(id, userId) {
  return Notification.findOneAndUpdate(
    { _id: id, user: userId },
    { isRead: true },
    { returnDocument: 'after' }
  );
}

async function markAllRead(userId) {
  await Notification.updateMany({ user: userId, isRead: false }, { isRead: true });
}

module.exports = {
  createNotification,
  notifyMany,
  listForUser,
  markRead,
  markAllRead,
};
