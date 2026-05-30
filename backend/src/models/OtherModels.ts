import mongoose, { Schema } from 'mongoose';

// Collaboration Schema
const CollaborationSchema = new Schema({
  roomId: { type: String, required: true, unique: true },
  users: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  code: { type: String, default: '' },
  language: { type: String, default: 'javascript' }
}, {
  timestamps: true
});

export const Collaboration = mongoose.model('Collaboration', CollaborationSchema);

// Notification Schema
const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, default: false },
  type: { type: String, enum: ['system', 'contest', 'comment', 'collab'], default: 'system' }
}, {
  timestamps: true
});

export const Notification = mongoose.model('Notification', NotificationSchema);

// InterviewRecord Schema (For AI mock interviews)
const QuestionResponseSchema = new Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  evaluation: { type: String, required: true },
  score: { type: Number, default: 0 }
});

const InterviewRecordSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Technical', 'DSA', 'HR'], required: true },
  score: { type: Number, default: 0 },
  feedback: { type: String, default: '' },
  questions: [QuestionResponseSchema],
  atsScore: { type: Number, default: 0 } // If associated with resume review
}, {
  timestamps: true
});

export const InterviewRecord = mongoose.model('InterviewRecord', InterviewRecordSchema);
