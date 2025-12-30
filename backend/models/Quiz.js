import mongoose from 'mongoose';

const QuizSchema = new mongoose.Schema({
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title: { type: String, required: true },
  duration: { type: Number, default: 10 }, // ✅ Duration Field
  questions: [{
    questionText: String,
    options: [String], 
    correctIndex: Number 
  }],
  created_at: { type: Date, default: Date.now }
}, { versionKey: false });

export default mongoose.model('Quiz', QuizSchema);