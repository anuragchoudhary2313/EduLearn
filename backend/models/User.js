import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  password_hash: { type: String },
  role: { type: String, enum: ['student','instructor','admin'], default: 'student' },
  full_name: String,
  avatar_url: String,
  created_at: { type: Date, default: Date.now },
  refresh_tokens: [{ token: String, issued_at: Date }]
}, { versionKey: false });

// ✅ Use 'export default'
export default mongoose.model('User', UserSchema);