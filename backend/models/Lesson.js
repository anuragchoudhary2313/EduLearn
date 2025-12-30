import mongoose from 'mongoose';

const LessonSchema = new mongoose.Schema({
  module_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  title: { type: String, required: true },
  video_url: String,
  duration: Number,
  is_free_preview: { type: Boolean, default: false },
  order_index: { type: Number, default: 0 }
}, { versionKey: false });

export default mongoose.model('Lesson', LessonSchema);