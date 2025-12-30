import mongoose from 'mongoose';

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, default: 0 },
  thumbnail_url: String,
  published_status: { type: String, enum: ['draft','published'], default: 'draft' },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now },
  resources: [{ title: String, url: String }] 
}, { versionKey: false });

// ✅ Change to export default
export default mongoose.model('Course', CourseSchema);