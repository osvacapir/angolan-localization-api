import { Router } from 'express';
import { StatsController } from '@/controllers/statsController';

const router = Router();

// Public routes
router.get('/', StatsController.getStats);
router.get('/health', StatsController.getHealth);
router.get('/metrics', StatsController.getMetrics);

export default router;
