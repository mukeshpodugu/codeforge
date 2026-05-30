import { Router } from 'express';
import { getDeveloperInfo, submitContactForm } from '../controllers/portfolioController';

const router = Router();

router.get('/info', getDeveloperInfo);
router.post('/contact', submitContactForm);

export default router;
