const AuditLog = require('../models/AuditLog');

async function writeAudit({ user, action, entityType, entityId, metadata, ip }) {
  await AuditLog.create({
    user: user?._id || user || null,
    actorName: user?.fullName || user?.email || 'System',
    role: user?.role || 'system',
    action,
    entityType: entityType || '',
    entityId: entityId ? String(entityId) : '',
    metadata: metadata || {},
    ip: ip || '',
  });
}

async function listAuditLogs({ page = 1, limit = 40, action, role, q } = {}) {
  const filter = {};
  if (action) filter.action = action;
  if (role) filter.role = role;
  if (q) {
    filter.$or = [
      { action: { $regex: q, $options: 'i' } },
      { actorName: { $regex: q, $options: 'i' } },
      { entityType: { $regex: q, $options: 'i' } },
    ];
  }

  const skip = (Number(page) - 1) * Number(limit);
  const [items, total] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).populate('user', 'fullName email role'),
    AuditLog.countDocuments(filter),
  ]);

  return { items, total, page: Number(page), pages: Math.ceil(total / Number(limit)) };
}

module.exports = { writeAudit, listAuditLogs };
