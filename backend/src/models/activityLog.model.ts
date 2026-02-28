import { getPool, sql } from '../config/database';

export interface ActivityLog {
  id: number;
  user_id: number | null;
  method: string;
  path: string;
  status_code: number | null;
  response_time_ms: number | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: Date;
}

export class ActivityLogModel {
  /**
   * Get recent activity logs with optional filters
   */
  static async getRecent(options: {
    limit?: number;
    userId?: number;
    method?: string;
    path?: string;
  } = {}): Promise<ActivityLog[]> {
    const pool = await getPool();
    const request = pool.request();
    const conditions: string[] = [];

    if (options.userId) {
      conditions.push('a.user_id = @userId');
      request.input('userId', sql.Int, options.userId);
    }

    if (options.method) {
      conditions.push('a.method = @method');
      request.input('method', sql.NVarChar(10), options.method);
    }

    if (options.path) {
      conditions.push('a.path LIKE @path');
      request.input('path', sql.NVarChar(500), `%${options.path}%`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = options.limit || 100;
    request.input('limit', sql.Int, limit);

    const result = await request.query(`
      SELECT TOP (@limit) a.*, u.name AS user_name, u.email AS user_email
      FROM ActivityLogs a
      LEFT JOIN Users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `);

    return result.recordset;
  }

  /**
   * Get summary statistics
   */
  static async getSummary(): Promise<any> {
    const pool = await getPool();
    const result = await pool.request().query(`
      SELECT
        COUNT(*) as total_requests,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(response_time_ms) as avg_response_time,
        MAX(response_time_ms) as max_response_time,
        SUM(CASE WHEN status_code >= 400 THEN 1 ELSE 0 END) as error_count,
        SUM(CASE WHEN status_code < 400 THEN 1 ELSE 0 END) as success_count,
        (SELECT TOP 1 path FROM ActivityLogs GROUP BY path ORDER BY COUNT(*) DESC) as most_accessed_path,
        (SELECT TOP 1 method FROM ActivityLogs GROUP BY method ORDER BY COUNT(*) DESC) as most_used_method
      FROM ActivityLogs
      WHERE created_at >= DATEADD(DAY, -7, GETDATE())
    `);
    return result.recordset[0];
  }
}
