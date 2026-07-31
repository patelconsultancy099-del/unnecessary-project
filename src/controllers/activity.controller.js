import ActivityLog from '../models/ActivityLog.js';

export async function timeline(req, res) {
  const query = { owner: req.user.id };
  if (req.query.deviceId) query.device = req.query.deviceId;
  const logs = await ActivityLog.find(query).sort({ createdAt: -1 }).limit(Math.min(Number(req.query.limit || 200), 500));
  res.json({ logs });
}

export async function createNotification(req, res) {
  const log = await ActivityLog.create({ owner: req.user.id, device: req.body.deviceId, type: req.body.type, severity: req.body.severity || 'info', message: req.body.message, metadata: req.body.metadata || {} });
  req.app.get('io')?.to(`user:${req.user.id}`).emit('activity:new', { log });
  res.status(201).json({ log });
}
