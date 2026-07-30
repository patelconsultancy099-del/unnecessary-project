import Device from '../models/Device.js';
import Location from '../models/Location.js';
import { logActivity } from '../services/activity.service.js';

export async function currentLocation(req, res) {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  res.json({ location: device.currentLocation, lastSeenLocation: device.lastSeenLocation });
}

export async function addLocation(req, res) {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  const recordedAt = req.body.recordedAt ? new Date(req.body.recordedAt) : new Date();
  const location = await Location.create({ owner: req.user.id, device: device.id, ...req.body, location: { type: 'Point', coordinates: [req.body.longitude, req.body.latitude] }, recordedAt });
  device.currentLocation = { latitude: location.latitude, longitude: location.longitude, accuracy: location.accuracy, speed: location.speed, bearing: location.bearing, recordedAt };
  device.lastSeenLocation = { latitude: location.latitude, longitude: location.longitude, recordedAt };
  device.lastSeenAt = new Date();
  await device.save();
  req.app.get('io')?.to(`user:${req.user.id}`).emit('location:update', { deviceId: device.id, location });
  res.status(201).json({ location });
}

export async function history(req, res) {
  const limit = Math.min(Number(req.query.limit || 200), 1000);
  const locations = await Location.find({ owner: req.user.id, device: req.params.deviceId }).sort({ recordedAt: -1 }).limit(limit);
  res.json({ locations: locations.reverse() });
}

export async function startTracking(req, res) {
  const device = await Device.findOneAndUpdate({ _id: req.params.deviceId, owner: req.user.id }, { trackingEnabled: true, status: 'tracking' }, { new: true });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  await logActivity({ owner: req.user.id, device: device.id, type: 'tracking.started', message: 'Tracking started' });
  res.json({ device });
}

export async function stopTracking(req, res) {
  const device = await Device.findOneAndUpdate({ _id: req.params.deviceId, owner: req.user.id }, { trackingEnabled: false, status: 'online' }, { new: true });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  await logActivity({ owner: req.user.id, device: device.id, type: 'tracking.stopped', message: 'Tracking stopped' });
  res.json({ device });
}

