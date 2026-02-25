import { getPool, sql } from '../config/database';
import { Category } from '../types';

export class CategoryModel {
  static async findAll(search?: string): Promise<Category[]> {
    const pool = await getPool();
    let query = 'SELECT * FROM Categories';

    const request = pool.request();

    if (search && search.trim()) {
      query += ` WHERE name COLLATE Latin1_General_100_CI_AS_SC_UTF8 LIKE @search
                 OR description COLLATE Latin1_General_100_CI_AS_SC_UTF8 LIKE @search`;
      request.input('search', sql.NVarChar(255), `%${search.trim()}%`);
    }

    query += ' ORDER BY created_at DESC';

    const result = await request.query(query);
    return result.recordset;
  }

  static async findById(id: number): Promise<Category | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM Categories WHERE id = @id');
    return result.recordset[0] || null;
  }

  static async create(name: string, description: string | null): Promise<Category> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .query(`
        INSERT INTO Categories (name, description)
        OUTPUT INSERTED.*
        VALUES (@name, @description)
      `);
    return result.recordset[0];
  }

  static async update(id: number, name: string, description: string | null): Promise<Category | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .query(`
        UPDATE Categories
        SET name = @name, description = @description, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `);
    return result.recordset[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Categories WHERE id = @id');
    return (result.rowsAffected[0] || 0) > 0;
  }
}
