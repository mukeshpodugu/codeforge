import mongoose, { Schema } from 'mongoose';

const ProfileSchema = new Schema({
  fullName: { type: String, default: '' },
  avatar: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: { type: [String], default: [] },
  streak: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  solvedStats: {
    easy: { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    hard: { type: Number, default: 0 }
  },
  submissionsCount: { type: Number, default: 0 },
  acceptedCount: { type: Number, default: 0 },
  contestRating: { type: Number, default: 1500 },
  submissionCalendar: { type: Map, of: Number, default: {} } // For heatmap: 'YYYY-MM-DD' -> count
});

const UserSchema = new Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: '' },
  resetPasswordToken: { type: String, default: '' },
  profile: { type: ProfileSchema, default: () => ({}) }
}, {
  timestamps: true
});

export const User = mongoose.model('User', UserSchema);
export default User;
