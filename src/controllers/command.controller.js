import Command from '../models/Command.js';
import { createCommand } from '../services/command.service.js';

const map = {
  ring: 'ring',
  stopRing: 'stop_ring',
  lock: 'lock',
  flashlight: 'flashlight_sos',
  stopFlashlight: 'stop_flashlight',
  capturePhoto: 'capture_photo',
  captureVideo: 'capture_video',
  remoteMessage: 'remote_message',
  enableTheftMode: 'enable_theft_mode',
  disableTheftMode: 'disable_theft_mode',
  startTracking: 'start_tracking',
  stopTracking: 'stop_tracking'
};

export function enqueue(typeKey) {
  return async (req, res) => {
    const command = await createCommand({ req, deviceId: req.params.deviceId, type: map[typeKey], payload: req.body || {} });
    res.status(202).json({ command });
  };
}

export async function listCommands(req, res) {
  const commands = await Command.find({ owner: req.user.id, device: req.params.deviceId }).sort({ createdAt: -1 }).limit(100);
  res.json({ commands });
}

export async function updateCommandStatus(req, res) {
  const command = await Command.findOne({ _id: req.params.commandId, owner: req.user.id });
  if (!command) return res.status(404).json({ message: 'Command not found' });
  command.status = req.body.status;
  command.error = req.body.error;
  if (req.body.status === 'acknowledged') command.acknowledgedAt = new Date();
  if (['completed', 'failed'].includes(req.body.status)) command.completedAt = new Date();
  await command.save();
  req.app.get('io')?.to(`user:${req.user.id}`).emit('command:update', { command });
  res.json({ command });
}
