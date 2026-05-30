"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voteDiscussion = exports.commentDiscussion = exports.createDiscussion = exports.getDiscussionDetail = exports.getDiscussions = void 0;
const repo_1 = require("../utils/repo");
const getDiscussions = async (req, res) => {
    const { category } = req.query;
    try {
        const list = await repo_1.Repo.listDiscussions(category);
        return res.json(list);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getDiscussions = getDiscussions;
const getDiscussionDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const thread = await repo_1.Repo.findDiscussionById(id);
        if (!thread)
            return res.status(404).json({ message: 'Discussion thread not found.' });
        return res.json(thread);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.getDiscussionDetail = getDiscussionDetail;
const createDiscussion = async (req, res) => {
    const { title, content, category } = req.body;
    const author = req.user.id;
    if (!title || !content) {
        return res.status(400).json({ message: 'Title and content are required.' });
    }
    try {
        const newThread = await repo_1.Repo.createDiscussion({
            title,
            content,
            category: category || 'General',
            author,
            upvotes: [],
            downvotes: [],
            comments: [],
            reputationPoints: 0
        });
        return res.status(201).json({ message: 'Thread created successfully.', discussion: newThread });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.createDiscussion = createDiscussion;
const commentDiscussion = async (req, res) => {
    const { id } = req.params;
    const { content } = req.body;
    const author = req.user.id;
    if (!content)
        return res.status(400).json({ message: 'Comment content cannot be empty.' });
    try {
        const thread = await repo_1.Repo.findDiscussionById(id);
        if (!thread)
            return res.status(404).json({ message: 'Discussion thread not found.' });
        const comments = [...(thread.comments || []), {
                author,
                content,
                upvotes: [],
                downvotes: [],
                createdAt: new Date()
            }];
        await repo_1.Repo.updateDiscussion(id, { comments });
        const updated = await repo_1.Repo.findDiscussionById(id);
        return res.json({ message: 'Comment added successfully.', comments: updated.comments });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.commentDiscussion = commentDiscussion;
const voteDiscussion = async (req, res) => {
    const { id } = req.params;
    const { type } = req.body; // 'upvote' or 'downvote'
    const userId = req.user.id;
    if (!['upvote', 'downvote'].includes(type)) {
        return res.status(400).json({ message: 'Invalid vote type. Use "upvote" or "downvote".' });
    }
    try {
        const thread = await repo_1.Repo.findDiscussionById(id);
        if (!thread)
            return res.status(404).json({ message: 'Discussion thread not found.' });
        let upvotes = (thread.upvotes || []).map(String);
        let downvotes = (thread.downvotes || []).map(String);
        if (type === 'upvote') {
            // Toggle upvote
            if (upvotes.includes(String(userId))) {
                upvotes = upvotes.filter(uid => uid !== String(userId));
            }
            else {
                upvotes.push(String(userId));
                downvotes = downvotes.filter(uid => uid !== String(userId));
            }
        }
        else {
            // Toggle downvote
            if (downvotes.includes(String(userId))) {
                downvotes = downvotes.filter(uid => uid !== String(userId));
            }
            else {
                downvotes.push(String(userId));
                upvotes = upvotes.filter(uid => uid !== String(userId));
            }
        }
        const reputationPoints = upvotes.length - downvotes.length;
        await repo_1.Repo.updateDiscussion(id, {
            upvotes,
            downvotes,
            reputationPoints
        });
        return res.json({
            message: 'Vote saved.',
            upvotesCount: upvotes.length,
            downvotesCount: downvotes.length,
            reputationPoints
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
exports.voteDiscussion = voteDiscussion;
