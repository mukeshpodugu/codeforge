"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLeaderboard = exports.joinContest = exports.getContestDetail = exports.getContests = void 0;
const repo_1 = require("../utils/repo");
const getContests = async (req, res) => {
    try {
        const contests = await repo_1.Repo.listContests();
        return res.json(contests);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getContests = getContests;
const getContestDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const contest = await repo_1.Repo.findContestById(id);
        if (!contest)
            return res.status(404).json({ message: 'Contest not found.' });
        return res.json(contest);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getContestDetail = getContestDetail;
const joinContest = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    try {
        const contest = await repo_1.Repo.findContestById(id);
        if (!contest)
            return res.status(404).json({ message: 'Contest not found.' });
        // Check if already joined
        const exists = contest.participants.some((p) => String(p.userId) === String(userId));
        if (exists) {
            return res.status(400).json({ message: 'Already joined this contest.' });
        }
        const participants = [...contest.participants, { userId, score: 0, finishTime: new Date() }];
        // Recalculate leaderboard mock ranks
        const leaderboard = [...contest.leaderboard];
        const username = req.user.username;
        const rank = leaderboard.length + 1;
        leaderboard.push({
            rank,
            username,
            score: 0,
            timeTaken: 0
        });
        await repo_1.Repo.updateContest(id, { participants, leaderboard });
        return res.json({ message: 'Successfully joined contest.', contest });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.joinContest = joinContest;
const getLeaderboard = async (req, res) => {
    const { id } = req.params;
    try {
        const contest = await repo_1.Repo.findContestById(id);
        if (!contest)
            return res.status(404).json({ message: 'Contest not found.' });
        return res.json(contest.leaderboard || []);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getLeaderboard = getLeaderboard;
