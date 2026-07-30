import streamifier from 'streamifier';
import Device from '../models/Device.js';
import Media from '../models/Media.js';
import { cloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activity.service.js';

function uploadToCloudinary(file, folder, resourceType) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    return Promise.resolve({ secure_url: `local://${file.originalname}`, public_id: file.originalname, bytes: file.size });
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => (error ? reject(error) : resolve(result)));
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export async function uploadMedia(req, res) {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  if (!req.file) return res.status(400).json({ message: 'Media file is required' });
  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
  const result = await uploadToCloudinary(req.file, `secureguard/${device.deviceId}/${type}s`, type === 'video' ? 'video' : 'image');
  const media = await Media.create({
    owner: req.user.id,
    device: device.id,
    command: req.body.commandId,
    type,
    url: result.secure_url,
    publicId: result.public_id,
    bytes: result.bytes,
    mimeType: req.file.mimetype,
    recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date()
  });
  await logActivity({ owner: req.user.id, device: device.id, type: `${type}.uploaded`, message: `${type} uploaded`, metadata: { mediaId: media.id } });
  req.app.get('io')?.to(`user:${req.user.id}`).emit('media:new', { media });
  res.status(201).json({ media });
}

export async function listMedia(req, res) {
  const query = { owner: req.user.id, device: req.params.deviceId };
  if (req.query.type) query.type = req.query.type;
  const media = await Media.find(query).sort({ recordedAt: -1 }).limit(200);
  res.json({ media });
}
