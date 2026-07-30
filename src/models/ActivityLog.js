import mongoose from 'mongoose';

const activityLogSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', index: true },
    type: { type: String, required: true, index: true },
    severity: { type: String, enum: ['info', 'warning', 'critical'], default: 'info' },
    message: { type: String, required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { timestamps: true }
);

activityLogSchema.index({ owner: 1, createdAt: -1 });

export default mongoose.model('ActivityLog', activityLogSchema);
