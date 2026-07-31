import mongoose from 'mongoose';

const mediaSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    device: { type: mongoose.Schema.Types.ObjectId, ref: 'Device', required: true, index: true },
    command: { type: mongoose.Schema.Types.ObjectId, ref: 'Command' },
    type: { type: String, enum: ['photo', 'video'], required: true, index: true },
    url: { type: String, required: true },
    publicId: String,
    bytes: Number,
    mimeType: String,
    recordedAt: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

mediaSchema.index({ device: 1, type: 1, recordedAt: -1 });

export default mongoose.model('Media', mediaSchema);
