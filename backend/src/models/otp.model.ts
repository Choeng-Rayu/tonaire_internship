import { getPool, sql } from '../config/database';
import { OtpCode } from '../types';

export class OtpModel {
  static async create(userId: number, otp: string, expiresAt: Date): Promise<OtpCode> {
    const pool = await getPool();
    // Invalidate any existing unused OTPs for this user
    await pool
      .request()
      .input('user_id', sql.Int, userId)
      .query('UPDATE OtpCodes SET used = 1 WHERE user_id = @user_id AND used = 0');

    const result = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('otp', sql.VarChar(6), otp)
      .input('expires_at', sql.DateTime, expiresAt)
      .query(`
        INSERT INTO OtpCodes (user_id, otp, expires_at)
        OUTPUT INSERTED.*
        VALUES (@user_id, @otp, @expires_at)
      `);
    return result.recordset[0];
  }

  static async verify(userId: number, otp: string): Promise<OtpCode | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('otp', sql.VarChar(6), otp)
      .query(`
        SELECT * FROM OtpCodes
        WHERE user_id = @user_id
          AND otp = @otp
          AND used = 0
          AND expires_at > GETDATE()
        ORDER BY created_at DESC
      `);
    return result.recordset[0] || null;
  }

  static async markUsed(id: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .query('UPDATE OtpCodes SET used = 1 WHERE id = @id');
  }

  static async invalidateAllForUser(userId: number): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('user_id', sql.Int, userId)
      .query('UPDATE OtpCodes SET used = 1 WHERE user_id = @user_id AND used = 0');
  }

  static async findValidOtp(userId: number, otp: string): Promise<OtpCode | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('user_id', sql.Int, userId)
      .input('otp', sql.VarChar(6), otp)
      .query(`
        SELECT * FROM OtpCodes
        WHERE user_id = @user_id
          AND otp = @otp
          AND used = 0
          AND expires_at > GETDATE()
        ORDER BY created_at DESC
      `);
    return result.recordset[0] || null;
  }
}
