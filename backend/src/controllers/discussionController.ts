import { Response } from 'express';
import { Repo } from '../utils/repo';
import { AuthenticatedRequest } from '../middleware/auth';

export const getDiscussions = async (req: AuthenticatedRequest, res: Response) => {
  const { category } = req.query;

  try {
    const list = await Repo.listDiscussions(category as string);
    return res.json(list);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getDiscussionDetail = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  try {
    const thread = await Repo.findDiscussionById(id);
    if (!thread) return res.status(404).json({ message: 'Discussion thread not found.' });

    return res.json(thread);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  const { title, content, category } = req.body;
  const author = req.user!.id;

  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }

  try {
    const newThread = await Repo.createDiscussion({
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const commentDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { content } = req.body;
  const author = req.user!.id;

  if (!content) return res.status(400).json({ message: 'Comment content cannot be empty.' });

  try {
    const thread = await Repo.findDiscussionById(id);
    if (!thread) return res.status(404).json({ message: 'Discussion thread not found.' });

    const comments = [...(thread.comments || []), {
      author,
      content,
      upvotes: [],
      downvotes: [],
      createdAt: new Date()
    }];

    await Repo.updateDiscussion(id, { comments });
    const updated = await Repo.findDiscussionById(id);

    return res.json({ message: 'Comment added successfully.', comments: updated.comments });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const voteDiscussion = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  const { type } = req.body; // 'upvote' or 'downvote'
  const userId = req.user!.id;

  if (!['upvote', 'downvote'].includes(type)) {
    return res.status(400).json({ message: 'Invalid vote type. Use "upvote" or "downvote".' });
  }

  try {
    const thread = await Repo.findDiscussionById(id);
    if (!thread) return res.status(404).json({ message: 'Discussion thread not found.' });

    let upvotes: string[] = (thread.upvotes || []).map(String);
    let downvotes: string[] = (thread.downvotes || []).map(String);

    if (type === 'upvote') {
      // Toggle upvote
      if (upvotes.includes(String(userId))) {
        upvotes = upvotes.filter(uid => uid !== String(userId));
      } else {
        upvotes.push(String(userId));
        downvotes = downvotes.filter(uid => uid !== String(userId));
      }
    } else {
      // Toggle downvote
      if (downvotes.includes(String(userId))) {
        downvotes = downvotes.filter(uid => uid !== String(userId));
      } else {
        downvotes.push(String(userId));
        upvotes = upvotes.filter(uid => uid !== String(userId));
      }
    }

    const reputationPoints = upvotes.length - downvotes.length;

    await Repo.updateDiscussion(id, {
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
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
