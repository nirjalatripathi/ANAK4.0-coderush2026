const { listForUser, markRead, markAllRead, createNotification } = require('../../services/notificationService');
const { AppError } = require('../../middleware/errorMiddleware');

async function list(req, res, next) {
  try {
    const notifications = await listForUser(req.user, { unreadOnly: req.query.unread === 'true' });
    res.json({ success: true, notifications });
  } catch (error) {
    next(error);
  }
}

async function readOne(req, res, next) {
  try {
    const notification = await markRead(req.params.id, req.user._id);
    if (!notification) throw new AppError('Notification not found', 404);
    res.json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

async function readAll(req, res, next) {
  try {
    await markAllRead(req.user._id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
}

async function announce(req, res, next) {
  try {
    if (!req.body.title || !req.body.body) throw new AppError('Title and message are required', 400);
    const notification = await createNotification({
      audience: req.body.audience || 'all',
      role: req.body.role,
      title: req.body.title,
      body: req.body.body,
      type: req.body.type || 'emergency_announcement',
    });
    res.status(201).json({ success: true, notification });
  } catch (error) {
    next(error);
  }
}

module.exports = { list, readOne, readAll, announce };
