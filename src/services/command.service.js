import Command from '../models/Command.js';
import Device from '../models/Device.js';
import { logActivity } from './activity.service.js';

export async function createCommand({ req, deviceId, type, payload = {} }) {
  const device = await Device.findOne({ _id: deviceId, owner: req.user.id });
  if (!device) {
    const error = new Error('Device not found');
    error.status = 404;
    throw error;
  }
  const command = await Command.create({ owner: req.user.id, device: device.id, type, payload });
  await logActivity({
    owner: req.user.id,
    device: device.id,
    type: `command.${type}`,
    message: `Command queued: ${type}`,
    metadata: { commandId: command.id, payload }
  });
  const io = req.app.get('io');
  io?.to(`device:${device.deviceId}`).emit('command', {
    id: command.id,
    type: command.type,
    payload: command.payload,
    createdAt: command.createdAt
  });
  command.status = 'sent';
  await command.save();
  return command;
}
