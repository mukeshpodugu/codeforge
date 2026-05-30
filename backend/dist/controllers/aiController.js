"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInterviewHistory = exports.generateRoadmap = exports.saveInterviewResult = exports.chatInterview = exports.analyzeResume = void 0;
const aiService_1 = require("../services/aiService");
const repo_1 = require("../utils/repo");
const analyzeResume = async (req, res) => {
    const { fileName, skillsText, experienceText } = req.body;
    const userId = req.user.id;
    if (!fileName || !skillsText) {
        return res.status(400).json({ message: 'File name and text content are required.' });
    }
    try {
        const report = await aiService_1.AiService.analyzeResume({
            fileName,
            skillsText,
            experienceText: experienceText || ''
        });
        // Save under InterviewRecords for logging history
        await repo_1.Repo.createInterviewRecord({
            userId,
            type: 'Technical',
            score: report.atsScore,
            feedback: report.feedback,
            atsScore: report.atsScore,
            questions: [
                {
                    question: 'Resume Skills Scan',
                    answer: `File: ${fileName}`,
                    evaluation: `Matched Skills: ${report.matchedSkills.join(', ')}. Missing key skills: ${report.missingSkills.join(', ')}`,
                    score: report.atsScore
                }
            ]
        });
        return res.json(report);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.analyzeResume = analyzeResume;
const chatInterview = async (req, res) => {
    const { history, currentMessage, type } = req.body;
    const userId = req.user.id;
    if (!currentMessage || !type) {
        return res.status(400).json({ message: 'Current message and interview type are required.' });
    }
    try {
        const chatHistory = history || [];
        const evaluation = await aiService_1.AiService.chatInterview(chatHistory, currentMessage, type);
        return res.json(evaluation);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.chatInterview = chatInterview;
const saveInterviewResult = async (req, res) => {
    const { type, score, feedback, questions } = req.body;
    const userId = req.user.id;
    if (!type || score === undefined) {
        return res.status(400).json({ message: 'Type and score are required.' });
    }
    try {
        const record = await repo_1.Repo.createInterviewRecord({
            userId,
            type,
            score,
            feedback: feedback || '',
            questions: questions || []
        });
        return res.status(201).json({
            message: 'Interview evaluation saved successfully.',
            record
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.saveInterviewResult = saveInterviewResult;
const generateRoadmap = async (req, res) => {
    const { skillLevel, goals, weakTopics } = req.body;
    if (!skillLevel || !goals || !weakTopics) {
        return res.status(400).json({ message: 'Skill level, learning goals, and weak topics are required.' });
    }
    try {
        const roadmap = await aiService_1.AiService.generateRoadmap(skillLevel, goals, weakTopics);
        return res.json(roadmap);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.generateRoadmap = generateRoadmap;
const getInterviewHistory = async (req, res) => {
    const userId = req.user.id;
    try {
        const history = await repo_1.Repo.listInterviewRecords(userId);
        return res.json(history);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getInterviewHistory = getInterviewHistory;
