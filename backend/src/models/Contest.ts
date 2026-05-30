import mongoose, { Schema } from 'mongoose';

const ParticipantSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  score: { type: Number, default: 0 },
  finishTime: { type: Date, default: Date.now }
});

const LeaderboardEntrySchema = new Schema({
  rank: { type: Number, required: true },
  username: { type: String, required: true },
  score: { type: Number, required: true },
  timeTaken: { type: Number, required: true } // in minutes
});

const ContestSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  problems: [{ type: Schema.Types.ObjectId, ref: 'Problem' }],
  participants: [ParticipantSchema],
  leaderboard: [LeaderboardEntrySchema]
}, {
  timestamps: true
});

export const Contest = mongoose.model('Contest', ContestSchema);
export default Contest;
