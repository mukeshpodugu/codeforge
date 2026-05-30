import mongoose, { Schema } from 'mongoose';

const CommentSchema = new Schema({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

const DiscussionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  upvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  downvotes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  category: { 
    type: String, 
    enum: ['General', 'Problems', 'Interviews', 'Contests', 'Feedback'],
    default: 'General'
  },
  comments: [CommentSchema],
  reputationPoints: { type: Number, default: 0 }
}, {
  timestamps: true
});

export const Discussion = mongoose.model('Discussion', DiscussionSchema);
export default Discussion;
