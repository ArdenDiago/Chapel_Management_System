// models/User.ts
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    set: (v) => v.toUpperCase()  // <-- Always store uppercase
  },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['master', 'admin'], default: 'admin' },
  created_at: { type: Date, default: Date.now }
});


export default mongoose.models.User || mongoose.model('User', UserSchema);
