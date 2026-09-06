const { listAuditLogs } = require('../../services/auditService');

async function list(req, res, next) {
  try {
    const result = await listAuditLogs(req.query);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
}

module.exports = { list };
