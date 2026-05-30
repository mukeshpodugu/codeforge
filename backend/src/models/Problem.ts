import mongoose, { Schema } from 'mongoose';

const StarterTemplateSchema = new Schema({
  language: { type: String, required: true },
  code: { type: String, required: true }
});

const TestCaseSchema = new Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false }
});

const ExampleSchema = new Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String }
});

const ProblemSchema = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true }, // Markdown description
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  category: { 
    type: String, 
    enum: ['Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Greedy', 'Backtracking', 'Sorting', 'Searching'],
    required: true 
  },
  constraints: { type: [String], default: [] },
  examples: { type: [ExampleSchema], default: [] },
  hints: { type: [String], default: [] },
  editorial: { type: String, default: '' },
  tags: { type: [String], default: [] },
  starterTemplates: { type: [StarterTemplateSchema], default: [] },
  testCases: { type: [TestCaseSchema], default: [] }, // Local or Judge0 validation cases
  timeLimit: { type: Number, default: 2000 }, // ms
  memoryLimit: { type: Number, default: 256000 }, // KB (256MB)
  acceptedCount: { type: Number, default: 0 },
  submittedCount: { type: Number, default: 0 },
  author: { type: Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

export const Problem = mongoose.model('Problem', ProblemSchema);
export default Problem;
