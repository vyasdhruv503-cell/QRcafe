import { Router } from 'express';
import { getMenuByTableToken, createOrder, getOrderByToken } from '../controllers/public.controller';
import { publicOrderLimiter } from '../middleware/rateLimiter';

const router = Router();

// Public menu loading by QR table token
router.get('/menu/:tableToken', getMenuByTableToken);

// Guest order creation (rate limited & server-calculated)
router.post('/orders', publicOrderLimiter, createOrder);

// Guest order tracking by order token
router.get('/orders/:orderToken', getOrderByToken);

export default router;
