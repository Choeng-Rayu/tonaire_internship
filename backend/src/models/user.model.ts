import { getPool, sql } from '../config/database';
import { User } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('email', sql.NVarChar(255), email)
      .query('SELECT * FROM Users WHERE email = @email');
    return result.recordset[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Users WHERE id = @id');
    return result.recordset[0] || null;
  }

  static async findByGoogleId(googleId: string): Promise<User | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('google_id', sql.NVarChar(255), googleId)
      .query('SELECT * FROM Users WHERE google_id = @google_id');
    return result.recordset[0] || null;
  }

  static async create(name: string, email: string, hashedPassword: string): Promise<User> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(255), email)
      .input('password', sql.NVarChar(255), hashedPassword)
      .query(`
        INSERT INTO Users (name, email, password, auth_provider)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @password, 'local')
      `);
    return result.recordset[0];
  }

  static async createGoogleUser(name: string, email: string, googleId: string): Promise<User> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(255), email)
      .input('google_id', sql.NVarChar(255), googleId)
      .query(`
        INSERT INTO Users (name, email, google_id, auth_provider)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @google_id, 'google')
      `);
    return result.recordset[0];
  }

  static async linkGoogleAccount(userId: number, googleId: string): Promise<User> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, userId)
      .input('google_id', sql.NVarChar(255), googleId)
      .query(`
        UPDATE Users SET google_id = @google_id, auth_provider = 
          CASE WHEN auth_provider = 'local' THEN 'local+google' ELSE auth_provider END,
          updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    return result.recordset[0];
  }

  static async updatePassword(id: number, hashedPassword: string): Promise<void> {
    const pool = await getPool();
    await pool
      .request()
      .input('id', sql.Int, id)
      .input('password', sql.NVarChar(255), hashedPassword)
      .query('UPDATE Users SET password = @password, updated_at = GETDATE() WHERE id = @id');
  }
}
