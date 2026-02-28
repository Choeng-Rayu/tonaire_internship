import { Request, Response } from 'express';
import { ActivityLogModel } from '../models/activityLog.model';
import { sendSuccess, sendError } from '../utils/response';

export class ActivityController {
  /**
   * GET /api/activity/logs
   * Get recent activity logs
   */
  static async getLogs(req: Request, res: Response): Promise<void> {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 100;
      const userId = req.query.user_id ? parseInt(req.query.user_id as string, 10) : undefined;
      const method = req.query.method as string | undefined;
      const path = req.query.path as string | undefined;

      const logs = await ActivityLogModel.getRecent({ limit, userId, method, path });
      sendSuccess(res, 'Activity logs fetched successfully.', logs);
    } catch (error) {
      console.error('Get activity logs error:', error);
      sendError(res, 'Failed to fetch activity logs.', 500);
    }
  }

  /**
   * GET /api/activity/summary
   * Get activity summary statistics
   */
  static async getSummary(req: Request, res: Response): Promise<void> {
    try {
      const summary = await ActivityLogModel.getSummary();
      sendSuccess(res, 'Activity summary fetched successfully.', summary);
    } catch (error) {
      console.error('Get activity summary error:', error);
      sendError(res, 'Failed to fetch activity summary.', 500);
    }
  }
}
