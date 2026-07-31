import crypto from 'crypto';
import Device from '../models/Device.js';
import { logActivity } from '../services/activity.service.js';

export async function registerDevice(req, res) {
  const existing = await Device.findOne({ deviceId: req.body.deviceId, owner: req.user.id });
  const deviceSecret = existing?.deviceSecret || crypto.randomBytes(32).toString('hex');
  const payload = { ...req.body, owner: req.user.id, deviceSecret, lastSeenAt: new Date(), status: 'online' };
  const device = await Device.findOneAndUpdate({ deviceId: req.body.deviceId, owner: req.user.id }, payload, { new: true, upsert: true, setDefaultsOnInsert: true });
  await logActivity({ owner: req.user.id, device: device.id, type: 'device.registered', message: `${device.name} registered` });
  res.status(201).json({ device });
}

export async function listDevices(req, res) {
  const devices = await Device.find({ owner: req.user.id }).sort({ lastSeenAt: -1 });
  res.json({ devices });
}

export async function getDevice(req, res) {
  const device = await Device.findOne({ _id: req.params.id, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  res.json({ device });
}

export async function updateDevice(req, res) {
  const allowed = ['name', 'pushToken', 'lockMessage', 'emergencyContact'];
  const update = Object.fromEntries(Object.entries(req.body).filter(([key]) => allowed.includes(key)));
  const device = await Device.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, update, { new: true });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  res.json({ device });
}

export async function deleteDevice(req, res) {
  const device = await Device.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  await logActivity({ owner: req.user.id, device: device.id, type: 'device.deleted', message: `${device.name} deleted` });
  res.status(204).send();
}

export async function updateBattery(req, res) {
  const device = await Device.findOneAndUpdate(
    { _id: req.params.id, owner: req.user.id },
    { battery: { ...req.body, updatedAt: new Date() }, lastSeenAt: new Date(), status: 'online' },
    { new: true }
  );
  if (!device) return res.status(404).json({ message: 'Device not found' });
  await logActivity({ owner: req.user.id, device: device.id, type: 'battery.updated', message: `Battery ${req.body.percent}%`, metadata: req.body });
  req.app.get('io')?.to(`user:${req.user.id}`).emit('battery:update', { deviceId: device.id, battery: device.battery });
  res.json({ device });
}
