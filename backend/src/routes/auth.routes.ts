import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { authenticateToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', authLimiter, login);
router.get('/me', authenticateToken, getMe);

export default router;
