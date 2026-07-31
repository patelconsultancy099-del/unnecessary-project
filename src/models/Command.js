import mongoose from 'mongoose';

const commandSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ['ring', 'stop_ring', 'lock', 'flashlight_sos', 'stop_flashlight', 'capture_photo', 'capture_video', 'remote_message', 'start_tracking', 'stop_tracking', 'enable_theft_mode', 'disable_theft_mode']
    },
    payload: { type: mongoose.Schema.Types.Mixed, default: {} },
    status: { type: String, enum: ['queued', 'sent', 'acknowledged', 'completed', 'failed'], default: 'queued', index: true },
    error: String,
    acknowledgedAt: Date,
    completedAt: Date
  },
  { timestamps: true }
);

commandSchema.index({ device: 1, createdAt: -1 });

export default mongoose.model('Command', commandSchema);
