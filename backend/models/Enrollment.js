import mongoose from 'mongoose';

const EnrollmentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  transaction_id: String,
  enrolled_at: { type: Date, default: Date.now }
}, { versionKey: false });

EnrollmentSchema.index({ user_id: 1, course_id: 1 }, { unique: true });

export default mongoose.model('Enrollment', EnrollmentSchema);