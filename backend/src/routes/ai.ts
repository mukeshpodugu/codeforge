import { Router } from 'express';
import { analyzeResume, chatInterview, saveInterviewResult, generateRoadmap, getInterviewHistory } from '../controllers/aiController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/analyze-resume', authenticateToken, analyzeResume);
router.post('/interview/chat', authenticateToken, chatInterview);
router.post('/interview/result', authenticateToken, saveInterviewResult);
router.post('/roadmap', authenticateToken, generateRoadmap);
router.get('/interview/history', authenticateToken, getInterviewHistory);

export default router;
