import mongoose from 'mongoose';

const batterySchema = new mongoose.Schema(
  {
    percent: { type: Number, min: 0, max: 100 },
    charging: Boolean,
    temperature: Number,
    health: String,
    updatedAt: Date
  },
  { _id: false }
);

const deviceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    deviceId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    model: String,
    manufacturer: String,
    androidVersion: String,
    pushToken: String,
    status: { type: String, enum: ['online', 'offline', 'tracking', 'theft'], default: 'offline', index: true },
    connectionId: String,
    lockMessage: { type: String, default: 'This phone is protected by SecureGuard.' },
    emergencyContact: String,
    currentLocation: {
      latitude: Number,
      longitude: Number,
      accuracy: Number,
      speed: Number,
      bearing: Number,
      recordedAt: Date
    },
    lastSeenLocation: {
      latitude: Number,
      longitude: Number,
      recordedAt: Date
    },
    battery: batterySchema,
    lastSeenAt: { type: Date, index: true },
    trackingEnabled: { type: Boolean, default: false },
    theftModeEnabled: { type: Boolean, default: false }
  },
  { timestamps: true }
);

deviceSchema.index({ owner: 1, status: 1 });

export default mongoose.model('Device', deviceSchema);
