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

  static async create(name: string, email: string, hashedPassword: string): Promise<User> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(100), name)
      .input('email', sql.NVarChar(255), email)
      .input('password', sql.NVarChar(255), hashedPassword)
      .query(`
        INSERT INTO Users (name, email, password)
        OUTPUT INSERTED.*
        VALUES (@name, @email, @password)
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
