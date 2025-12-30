import mongoose from 'mongoose';

const ModuleSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  order_index: { type: Number, default: 0 }
}, { versionKey: false });

export default mongoose.model('Module', ModuleSchema);