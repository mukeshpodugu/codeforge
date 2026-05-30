"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Problem = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const StarterTemplateSchema = new mongoose_1.Schema({
    language: { type: String, required: true },
    code: { type: String, required: true }
});
const TestCaseSchema = new mongoose_1.Schema({
    input: { type: String, required: true },
    expectedOutput: { type: String, required: true },
    isHidden: { type: Boolean, default: false }
});
const ExampleSchema = new mongoose_1.Schema({
    input: { type: String, required: true },
    output: { type: String, required: true },
    explanation: { type: String }
});
const ProblemSchema = new mongoose_1.Schema({
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
    author: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }
}, {
    timestamps: true
});
exports.Problem = mongoose_1.default.model('Problem', ProblemSchema);
exports.default = exports.Problem;
