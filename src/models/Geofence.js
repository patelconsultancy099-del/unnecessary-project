import mongoose from 'mongoose';

const geofenceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    name: { type: String, required: true, trim: true },
    center: {
      latitude: { type: Number, required: true, min: -90, max: 90 },
      longitude: { type: Number, required: true, min: -180, max: 180 }
    },
    radiusMeters: { type: Number, required: true, min: 50, max: 100000 },
    active: { type: Boolean, default: true, index: true },
    lastExitedAt: Date
  },
  { timestamps: true }
);

geofenceSchema.index({ owner: 1, device: 1, active: 1 });

export default mongoose.model('Geofence', geofenceSchema);
