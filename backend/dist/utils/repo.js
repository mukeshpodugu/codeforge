"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Repo = void 0;
const db_1 = require("../config/db");
const User_1 = require("../models/User");
const Problem_1 = require("../models/Problem");
const Submission_1 = require("../models/Submission");
const Contest_1 = require("../models/Contest");
const Discussion_1 = require("../models/Discussion");
const OtherModels_1 = require("../models/OtherModels");
const dbStore_1 = require("./dbStore");
class Repo {
    // === USER OPERATIONS ===
    static async findUserById(id) {
        if (db_1.isMongoConnected)
            return await User_1.User.findById(id).exec();
        return dbStore_1.JsonDb.findOne('users', u => u._id === id || u.id === id);
    }
    static async findUserByEmail(email) {
        if (db_1.isMongoConnected)
            return await User_1.User.findOne({ email: email.toLowerCase() }).exec();
        return dbStore_1.JsonDb.findOne('users', u => u.email.toLowerCase() === email.toLowerCase());
    }
    static async findUserByUsername(username) {
        if (db_1.isMongoConnected)
            return await User_1.User.findOne({ username }).exec();
        return dbStore_1.JsonDb.findOne('users', u => u.username === username);
    }
    static async createUser(userData) {
        if (db_1.isMongoConnected) {
            const u = new User_1.User(userData);
            return await u.save();
        }
        return dbStore_1.JsonDb.create('users', userData);
    }
    static async updateUser(id, updates) {
        if (db_1.isMongoConnected)
            return await User_1.User.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
        return dbStore_1.JsonDb.update('users', id, updates);
    }
    // === PROBLEM OPERATIONS ===
    static async listProblems(filter = {}) {
        if (db_1.isMongoConnected)
            return await Problem_1.Problem.find(filter).exec();
        return dbStore_1.JsonDb.find('problems', p => {
            let match = true;
            if (filter.category)
                match = match && p.category === filter.category;
            if (filter.difficulty)
                match = match && p.difficulty === filter.difficulty;
            return match;
        });
    }
    static async findProblemBySlug(slug) {
        if (db_1.isMongoConnected)
            return await Problem_1.Problem.findOne({ slug }).exec();
        return dbStore_1.JsonDb.findOne('problems', p => p.slug === slug);
    }
    static async findProblemById(id) {
        if (db_1.isMongoConnected)
            return await Problem_1.Problem.findById(id).exec();
        return dbStore_1.JsonDb.findOne('problems', p => p._id === id || p.id === id);
    }
    static async createProblem(problemData) {
        if (db_1.isMongoConnected) {
            const p = new Problem_1.Problem(problemData);
            return await p.save();
        }
        return dbStore_1.JsonDb.create('problems', problemData);
    }
    // === SUBMISSION OPERATIONS ===
    static async createSubmission(submissionData) {
        if (db_1.isMongoConnected) {
            const s = new Submission_1.Submission(submissionData);
            return await s.save();
        }
        return dbStore_1.JsonDb.create('submissions', submissionData);
    }
    static async listSubmissions(filter = {}) {
        if (db_1.isMongoConnected)
            return await Submission_1.Submission.find(filter).sort({ createdAt: -1 }).exec();
        return dbStore_1.JsonDb.find('submissions', s => {
            let match = true;
            if (filter.userId)
                match = match && String(s.userId) === String(filter.userId);
            if (filter.problemId)
                match = match && String(s.problemId) === String(filter.problemId);
            return match;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    // === CONTEST OPERATIONS ===
    static async listContests() {
        if (db_1.isMongoConnected)
            return await Contest_1.Contest.find().exec();
        return dbStore_1.JsonDb.find('contests');
    }
    static async findContestById(id) {
        if (db_1.isMongoConnected)
            return await Contest_1.Contest.findById(id).populate('problems').exec();
        const contest = dbStore_1.JsonDb.findOne('contests', c => c._id === id || c.id === id);
        if (contest && contest.problems) {
            // populate problems manually in JSON mode
            contest.problems = contest.problems.map((pid) => dbStore_1.JsonDb.findOne('problems', p => p._id === pid || p.id === pid));
        }
        return contest;
    }
    static async createContest(contestData) {
        if (db_1.isMongoConnected) {
            const c = new Contest_1.Contest(contestData);
            return await c.save();
        }
        return dbStore_1.JsonDb.create('contests', contestData);
    }
    static async updateContest(id, updates) {
        if (db_1.isMongoConnected)
            return await Contest_1.Contest.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
        return dbStore_1.JsonDb.update('contests', id, updates);
    }
    // === DISCUSSION OPERATIONS ===
    static async listDiscussions(category) {
        if (db_1.isMongoConnected) {
            const query = category ? { category } : {};
            return await Discussion_1.Discussion.find(query).populate('author', 'username profile.fullName').sort({ createdAt: -1 }).exec();
        }
        const list = dbStore_1.JsonDb.find('discussions', d => !category || d.category === category);
        // populate author details manually
        return list.map(item => {
            const user = dbStore_1.JsonDb.findOne('users', u => u._id === item.author || u.id === item.author);
            return {
                ...item,
                author: user ? { _id: user.id, username: user.username, profile: user.profile } : { username: 'Guest' }
            };
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    static async findDiscussionById(id) {
        if (db_1.isMongoConnected)
            return await Discussion_1.Discussion.findById(id).populate('author', 'username profile.fullName').populate('comments.author', 'username profile.fullName').exec();
        const disc = dbStore_1.JsonDb.findOne('discussions', d => d._id === id || d.id === id);
        if (disc) {
            const author = dbStore_1.JsonDb.findOne('users', u => u._id === disc.author || u.id === disc.author);
            disc.author = author ? { _id: author.id, username: author.username, profile: author.profile } : { username: 'Guest' };
            if (disc.comments) {
                disc.comments = disc.comments.map((comment) => {
                    const commentUser = dbStore_1.JsonDb.findOne('users', u => u._id === comment.author || u.id === comment.author);
                    return {
                        ...comment,
                        author: commentUser ? { _id: commentUser.id, username: commentUser.username, profile: commentUser.profile } : { username: 'Guest' }
                    };
                });
            }
        }
        return disc;
    }
    static async createDiscussion(discussionData) {
        if (db_1.isMongoConnected) {
            const d = new Discussion_1.Discussion(discussionData);
            return await d.save();
        }
        return dbStore_1.JsonDb.create('discussions', discussionData);
    }
    static async updateDiscussion(id, updates) {
        if (db_1.isMongoConnected)
            return await Discussion_1.Discussion.findByIdAndUpdate(id, { $set: updates }, { new: true }).exec();
        return dbStore_1.JsonDb.update('discussions', id, updates);
    }
    // === INTERVIEW OPERATIONS ===
    static async createInterviewRecord(recordData) {
        if (db_1.isMongoConnected) {
            const rec = new OtherModels_1.InterviewRecord(recordData);
            return await rec.save();
        }
        return dbStore_1.JsonDb.create('interviewRecords', recordData);
    }
    static async listInterviewRecords(userId) {
        if (db_1.isMongoConnected)
            return await OtherModels_1.InterviewRecord.find({ userId }).sort({ createdAt: -1 }).exec();
        return dbStore_1.JsonDb.find('interviewRecords', r => String(r.userId) === String(userId)).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
}
exports.Repo = Repo;
