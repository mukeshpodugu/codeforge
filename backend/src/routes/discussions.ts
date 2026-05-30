import { Router } from 'express';
import { getDiscussions, getDiscussionDetail, createDiscussion, commentDiscussion, voteDiscussion } from '../controllers/discussionController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getDiscussions);
router.get('/:id', authenticateToken, getDiscussionDetail);
router.post('/', authenticateToken, createDiscussion);
router.post('/:id/comment', authenticateToken, commentDiscussion);
router.post('/:id/vote', authenticateToken, voteDiscussion);

export default router;
