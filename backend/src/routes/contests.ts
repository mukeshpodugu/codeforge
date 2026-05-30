import { Router } from 'express';
import { getContests, getContestDetail, joinContest, getLeaderboard } from '../controllers/contestController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, getContests);
router.get('/:id', authenticateToken, getContestDetail);
router.post('/:id/join', authenticateToken, joinContest);
router.get('/:id/leaderboard', authenticateToken, getLeaderboard);

export default router;
