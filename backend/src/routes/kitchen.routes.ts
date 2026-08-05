import { Router } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth';
import { getKitchenOrders, advanceKitchenOrderStatus } from '../controllers/kitchen.controller';

const router = Router();

// Protect kitchen routes (accessible by both ADMIN and KITCHEN roles)
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'KITCHEN']));

router.get('/orders', getKitchenOrders);
router.patch('/orders/:id/status', advanceKitchenOrderStatus);

export default router;
