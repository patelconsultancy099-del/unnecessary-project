import ActivityLog from '../models/ActivityLog.js';

export async function logActivity({ owner, device, type, severity = 'info', message, metadata = {} }) {
  const log = await ActivityLog.create({ owner, device, type, severity, message, metadata });
  return log;
}
