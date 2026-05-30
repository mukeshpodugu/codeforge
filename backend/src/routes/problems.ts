import { Router } from 'express';
import { getProblems, getProblemDetail, runCode, submitCode, getSubmissions } from '../controllers/problemController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Problem listing and details (public or secured)
router.get('/', getProblems);
router.get('/:slug', getProblemDetail);

// Secured coding operations
router.post('/run', authenticateToken, runCode);
router.post('/submit', authenticateToken, submitCode);
router.get('/submissions/history', authenticateToken, getSubmissions);

export default router;
