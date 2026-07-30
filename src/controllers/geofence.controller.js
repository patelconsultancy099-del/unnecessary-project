import Geofence from '../models/Geofence.js';
import { logActivity } from '../services/activity.service.js';

export async function createGeofence(req, res) {
  const geofence = await Geofence.create({ ...req.body, owner: req.user.id });
  res.status(201).json({ geofence });
}

export async function listGeofences(req, res) {
  const geofences = await Geofence.find({ owner: req.user.id }).sort({ createdAt: -1 });
  res.json({ geofences });
}

export async function updateGeofence(req, res) {
  const geofence = await Geofence.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, req.body, { new: true });
  if (!geofence) return res.status(404).json({ message: 'Geofence not found' });
  res.json({ geofence });
}

export async function deleteGeofence(req, res) {
  const geofence = await Geofence.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
  if (!geofence) return res.status(404).json({ message: 'Geofence not found' });
  res.status(204).send();
}

export async function geofenceExit(req, res) {
  const geofence = await Geofence.findOneAndUpdate({ _id: req.params.id, owner: req.user.id }, { lastExitedAt: new Date() }, { new: true });
  if (!geofence) return res.status(404).json({ message: 'Geofence not found' });
  const log = await logActivity({ owner: req.user.id, device: geofence.device, type: 'geofence.exit', severity: 'critical', message: `Exited geofence: ${geofence.name}`, metadata: { geofenceId: geofence.id } });
  req.app.get('io')?.to(`user:${req.user.id}`).emit('activity:new', { log });
  res.json({ geofence });
}
