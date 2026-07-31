import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';
import streamifier from 'streamifier';
import Device from '../models/Device.js';
import Media from '../models/Media.js';
import { cloudinary } from '../config/cloudinary.js';
import { logActivity } from '../services/activity.service.js';
import { verifyAccessToken } from '../utils/tokens.js';

async function uploadMediaFile(file, folder, resourceType) {
  if (!process.env.CLOUDINARY_CLOUD_NAME) {
    const extension = path.extname(file.originalname) || (resourceType === 'video' ? '.mp4' : '.jpg');
    const filename = `${randomUUID()}${extension}`;
    const uploadDir = path.join(process.cwd(), 'uploads', folder);
    await fs.mkdir(uploadDir, { recursive: true });
    const localPath = path.join(uploadDir, filename);
    await fs.writeFile(localPath, file.buffer);
    return { secure_url: null, public_id: localPath, bytes: file.size, isLocal: true };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder, resource_type: resourceType }, (error, result) => (error ? reject(error) : resolve({ ...result, isLocal: false })));
    streamifier.createReadStream(file.buffer).pipe(stream);
  });
}

export async function uploadMedia(req, res) {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user.id });
  if (!device) return res.status(404).json({ message: 'Device not found' });
  if (!req.file) return res.status(400).json({ message: 'Media file is required' });
  const type = req.file.mimetype.startsWith('video/') ? 'video' : 'photo';
  const result = await uploadMediaFile(req.file, `secureguard/${device.deviceId}/${type}s`, type === 'video' ? 'video' : 'image');
  const media = await Media.create({
    owner: req.user.id,
    device: device.id,
    command: req.body.commandId,
    type,
    url: result.secure_url || 'pending',
    publicId: result.public_id,
    bytes: result.bytes,
    mimeType: req.file.mimetype,
    recordedAt: req.body.recordedAt ? new Date(req.body.recordedAt) : new Date()
  });
  if (result.isLocal) {
    media.url = `${req.protocol}://${req.get('host')}/api/media/file/${media.id}`;
    await media.save();
  }
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

export async function streamMedia(req, res) {
  const token = req.query.token || (req.get('authorization') || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  let payload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
  const media = await Media.findOne({ _id: req.params.mediaId, owner: payload.sub });
  if (!media) return res.status(404).json({ message: 'Media not found' });
  if (!media.publicId || media.publicId.startsWith('secureguard/')) return res.redirect(media.url);
  res.type(media.mimeType || 'application/octet-stream');
  res.sendFile(path.resolve(media.publicId));
}
