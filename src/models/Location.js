import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    latitude: { type: mongoose.Schema.Types.Mixed, required: true },
    longitude: { type: mongoose.Schema.Types.Mixed, required: true },
    accuracy: Number,
    altitude: Number,
    speed: Number,
    bearing: Number,
    source: { type: String, enum: ['gps', 'network', 'fused', 'offline-sync'], default: 'fused' },
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [mongoose.Schema.Types.Mixed], required: true }
    },
    recordedAt: { type: Date, required: true, index: true }
  },
  { timestamps: true }
);

locationSchema.index({ device: 1, recordedAt: -1 });
locationSchema.index({ location: '2dsphere' });

export default mongoose.model('Location', locationSchema);

