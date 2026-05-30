import mongoose, { Schema } from 'mongoose';

const AiReviewSchema = new Schema({
  qualityScore: { type: Number, default: 0 },
  timeComplexity: { type: String, default: '' },
  spaceComplexity: { type: String, default: '' },
  bugs: { type: [String], default: [] },
  optimizations: { type: [String], default: [] },
  suggestions: { type: String, default: '' }
});

const SubmissionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  problemId: { type: Schema.Types.ObjectId, ref: 'Problem', required: true },
  language: { type: String, required: true },
  code: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Runtime Error', 'Compile Error', 'Pending'],
    default: 'Pending'
  },
  executionTime: { type: Number, default: 0 }, // ms
  memoryUsage: { type: Number, default: 0 }, // KB
  errorMessage: { type: String, default: '' },
  aiReview: { type: AiReviewSchema }
}, {
  timestamps: true
});

export const Submission = mongoose.model('Submission', SubmissionSchema);
export default Submission;
