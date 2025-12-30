import mongoose from 'mongoose';

const ProgressSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  is_completed: { type: Boolean, default: false },
  last_watched_position: { type: Number, default: 0 },
  updated_at: { type: Date, default: Date.now }
}, { versionKey: false });

ProgressSchema.index({ user_id: 1, lesson_id: 1 }, { unique: true });

export default mongoose.model('Progress', ProgressSchema);