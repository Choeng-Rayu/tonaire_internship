import { Router } from 'express';
import { ActivityController } from '../controllers/activity.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All activity routes require authentication
router.use(authMiddleware);

/**
 * GET /api/activity/logs
 * Query params: limit, user_id, method, path
 */
router.get('/logs', ActivityController.getLogs);

/**
 * GET /api/activity/summary
 * Get 7-day summary statistics
 */
router.get('/summary', ActivityController.getSummary);

export default router;
