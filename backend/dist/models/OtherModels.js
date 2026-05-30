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
exports.InterviewRecord = exports.Notification = exports.Collaboration = void 0;
const mongoose_1 = __importStar(require("mongoose"));
// Collaboration Schema
const CollaborationSchema = new mongoose_1.Schema({
    roomId: { type: String, required: true, unique: true },
    users: [{ type: mongoose_1.Schema.Types.ObjectId, ref: 'User' }],
    code: { type: String, default: '' },
    language: { type: String, default: 'javascript' }
}, {
    timestamps: true
});
exports.Collaboration = mongoose_1.default.model('Collaboration', CollaborationSchema);
// Notification Schema
const NotificationSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    type: { type: String, enum: ['system', 'contest', 'comment', 'collab'], default: 'system' }
}, {
    timestamps: true
});
exports.Notification = mongoose_1.default.model('Notification', NotificationSchema);
// InterviewRecord Schema (For AI mock interviews)
const QuestionResponseSchema = new mongoose_1.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    evaluation: { type: String, required: true },
    score: { type: Number, default: 0 }
});
const InterviewRecordSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['Technical', 'DSA', 'HR'], required: true },
    score: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    questions: [QuestionResponseSchema],
    atsScore: { type: Number, default: 0 } // If associated with resume review
}, {
    timestamps: true
});
exports.InterviewRecord = mongoose_1.default.model('InterviewRecord', InterviewRecordSchema);
