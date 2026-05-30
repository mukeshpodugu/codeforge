"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubmissions = exports.submitCode = exports.runCode = exports.getProblemDetail = exports.getProblems = void 0;
const repo_1 = require("../utils/repo");
const judgeService_1 = require("../services/judgeService");
const aiService_1 = require("../services/aiService");
const getProblems = async (req, res) => {
    const { category, difficulty } = req.query;
    try {
        const filter = {};
        if (category)
            filter.category = category;
        if (difficulty)
            filter.difficulty = difficulty;
        const problems = await repo_1.Repo.listProblems(filter);
        // Map to exclude test cases for security
        const sanitized = problems.map((p) => ({
            id: p._id || p.id,
            title: p.title,
            slug: p.slug,
            difficulty: p.difficulty,
            category: p.category,
            tags: p.tags,
            acceptedCount: p.acceptedCount,
            submittedCount: p.submittedCount
        }));
        return res.json(sanitized);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getProblems = getProblems;
const getProblemDetail = async (req, res) => {
    const { slug } = req.params;
    try {
        const problem = await repo_1.Repo.findProblemBySlug(slug);
        if (!problem)
            return res.status(404).json({ message: 'Problem not found.' });
        // Exclude hidden test cases, return public examples
        const sanitized = {
            id: problem._id || problem.id,
            title: problem.title,
            slug: problem.slug,
            description: problem.description,
            difficulty: problem.difficulty,
            category: problem.category,
            constraints: problem.constraints,
            examples: problem.examples,
            hints: problem.hints,
            tags: problem.tags,
            starterTemplates: problem.starterTemplates,
            timeLimit: problem.timeLimit,
            memoryLimit: problem.memoryLimit
        };
        return res.json(sanitized);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getProblemDetail = getProblemDetail;
const runCode = async (req, res) => {
    const { problemId, language, code, customInput } = req.body;
    if (!problemId || !language || !code) {
        return res.status(400).json({ message: 'Problem ID, language, and code are required.' });
    }
    try {
        const problem = await repo_1.Repo.findProblemById(problemId);
        // Support playground runs with dummy/null problemId
        const input = problem
            ? (customInput !== undefined ? customInput : (problem.examples[0]?.input || ''))
            : (customInput || '');
        const expected = problem
            ? (customInput !== undefined ? undefined : (problem.examples[0]?.output || ''))
            : undefined;
        const result = await judgeService_1.JudgeService.runCode({
            language,
            code,
            input,
            expectedOutput: expected
        });
        return res.json(result);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.runCode = runCode;
const submitCode = async (req, res) => {
    const { problemId, language, code } = req.body;
    const userId = req.user.id;
    if (!problemId || !language || !code) {
        return res.status(400).json({ message: 'Problem ID, language, and code are required.' });
    }
    try {
        const problem = await repo_1.Repo.findProblemById(problemId);
        if (!problem)
            return res.status(404).json({ message: 'Problem not found.' });
        const testCases = problem.testCases || [];
        if (testCases.length === 0) {
            return res.status(400).json({ message: 'No test cases configured for this problem.' });
        }
        let finalStatus = 'Accepted';
        let maxTime = 0;
        let maxMemory = 0;
        let errorMsg = '';
        let failedTestCaseIndex = -1;
        // Run test cases sequentially
        for (let i = 0; i < testCases.length; i++) {
            const tc = testCases[i];
            const result = await judgeService_1.JudgeService.runCode({
                language,
                code,
                input: tc.input,
                expectedOutput: tc.expectedOutput
            });
            maxTime = Math.max(maxTime, result.executionTime);
            maxMemory = Math.max(maxMemory, result.memoryUsage);
            if (result.status !== 'Accepted') {
                finalStatus = result.status;
                errorMsg = result.errorMessage || `Test case ${i + 1} failed.`;
                failedTestCaseIndex = i;
                break;
            }
        }
        // Run AI reviewer code review in background or concurrently
        const aiReview = await aiService_1.AiService.evaluateCode({
            code,
            problemTitle: problem.title,
            problemDifficulty: problem.difficulty,
            language
        });
        // Create submission record
        const submission = await repo_1.Repo.createSubmission({
            userId,
            problemId,
            language,
            code,
            status: finalStatus,
            executionTime: maxTime,
            memoryUsage: maxMemory,
            errorMessage: errorMsg,
            aiReview
        });
        // Update problem statistics
        const isSuccess = finalStatus === 'Accepted';
        const subIncr = 1;
        const accIncr = isSuccess ? 1 : 0;
        // In Mongoose Mode:
        // Update problem submission count, and update user statistics
        const user = await repo_1.Repo.findUserById(userId);
        if (user) {
            const today = new Date().toISOString().split('T')[0];
            const calendar = user.profile.submissionCalendar || {};
            calendar[today] = (calendar[today] || 0) + 1;
            const solvedStats = { ...(user.profile.solvedStats || { easy: 0, medium: 0, hard: 0 }) };
            if (isSuccess) {
                // Increment difficulty solved counters
                const diff = problem.difficulty.toLowerCase();
                if (solvedStats[diff] !== undefined) {
                    solvedStats[diff] += 1;
                }
            }
            await repo_1.Repo.updateUser(userId, {
                profile: {
                    ...user.profile,
                    submissionsCount: (user.profile.submissionsCount || 0) + 1,
                    acceptedCount: (user.profile.acceptedCount || 0) + (isSuccess ? 1 : 0),
                    solvedStats,
                    submissionCalendar: calendar
                }
            });
        }
        return res.json({
            message: isSuccess ? 'Solution Accepted!' : 'Solution Failed.',
            submission: {
                id: submission._id || submission.id,
                status: submission.status,
                executionTime: submission.executionTime,
                memoryUsage: submission.memoryUsage,
                errorMessage: submission.errorMessage,
                aiReview: submission.aiReview
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.submitCode = submitCode;
const getSubmissions = async (req, res) => {
    const { problemId } = req.query;
    const userId = req.user.id;
    try {
        const filter = { userId };
        if (problemId)
            filter.problemId = problemId;
        const list = await repo_1.Repo.listSubmissions(filter);
        return res.json(list);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getSubmissions = getSubmissions;
