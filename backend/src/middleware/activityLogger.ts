import { Request, Response, NextFunction } from 'express';
import { getPool, sql } from '../config/database';
import { JwtPayload } from '../types';

/**
 * Activity Logger Middleware
 * Logs all API requests to the ActivityLogs table for analytics.
 * Captures: user_id, method, path, status_code, response_time, ip, user_agent
 */
export function activityLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();

  // Capture the original end method
  const originalEnd = res.end;

  // Override res.end to capture the status code after the response is sent
  res.end = function (this: Response, ...args: any[]): Response {
    const responseTime = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Extract user id from JWT payload if authenticated
    const user = req.user as JwtPayload | undefined;
    const userId = user?.userId || null;

    // Get client IP
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    // Get user agent
    const userAgent = req.get('User-Agent') || 'unknown';

    // Log to database asynchronously (don't block the response)
    logActivity(userId, req.method, req.path, statusCode, responseTime, ip, userAgent)
      .catch((err) => console.error('Activity log error:', err.message));

    // Console log for dev visibility
    const userInfo = userId ? `[User:${userId}]` : '[Anonymous]';
    const statusEmoji = statusCode >= 400 ? '⚠️' : '✅';
    console.log(
      `${statusEmoji} ${userInfo} ${req.method} ${req.path} → ${statusCode} (${responseTime}ms)`
    );

    // Call the original end method
    return originalEnd.apply(this, args as any);
  } as any;

  next();
}

async function logActivity(
  userId: number | null,
  method: string,
  path: string,
  statusCode: number,
  responseTimeMs: number,
  ipAddress: string,
  userAgent: string
): Promise<void> {
  try {
    const pool = await getPool();
    await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('method', sql.NVarChar(10), method)
      .input('path', sql.NVarChar(500), path)
      .input('status_code', sql.Int, statusCode)
      .input('response_time_ms', sql.Int, responseTimeMs)
      .input('ip_address', sql.NVarChar(45), ipAddress)
      .input('user_agent', sql.NVarChar(500), userAgent ? userAgent.substring(0, 500) : 'unknown')
      .query(`
        INSERT INTO ActivityLogs (user_id, method, path, status_code, response_time_ms, ip_address, user_agent)
        VALUES (@user_id, @method, @path, @status_code, @response_time_ms, @ip_address, @user_agent)
      `);
  } catch (error) {
    // Silently fail - don't break the app if logging fails
    console.error('Failed to log activity:', (error as Error).message);
  }
}
