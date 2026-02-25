import { getPool, sql } from '../config/database';
import { Product, PaginatedResponse } from '../types';

export class ProductModel {
  static async findAll(options: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: string;
    search?: string;
    categoryId?: number;
  }): Promise<PaginatedResponse<Product>> {
    const pool = await getPool();

    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = (page - 1) * limit;
    const sortBy = options.sortBy === 'price' ? 'p.price' : 'p.name COLLATE Latin1_General_100_CI_AS_SC_UTF8';
    const sortOrder = options.sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    let whereClause = '';
    const conditions: string[] = [];

    const countRequest = pool.request();
    const dataRequest = pool.request();

    if (options.search && options.search.trim()) {
      conditions.push(`(p.name COLLATE Latin1_General_100_CI_AS_SC_UTF8 LIKE @search
                        OR p.description COLLATE Latin1_General_100_CI_AS_SC_UTF8 LIKE @search
                        OR c.name COLLATE Latin1_General_100_CI_AS_SC_UTF8 LIKE @search)`);
      const searchParam = `%${options.search.trim()}%`;
      countRequest.input('search', sql.NVarChar(255), searchParam);
      dataRequest.input('search', sql.NVarChar(255), searchParam);
    }

    if (options.categoryId) {
      conditions.push('p.category_id = @categoryId');
      countRequest.input('categoryId', sql.Int, options.categoryId);
      dataRequest.input('categoryId', sql.Int, options.categoryId);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Count total
    const countQuery = `
      SELECT COUNT(*) as total
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countResult = await countRequest.query(countQuery);
    const total = countResult.recordset[0].total;

    // Fetch data with pagination
    const dataQuery = `
      SELECT p.*, c.name AS category_name
      FROM Products p
      LEFT JOIN Categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY
    `;
    dataRequest.input('offset', sql.Int, offset);
    dataRequest.input('limit', sql.Int, limit);

    const dataResult = await dataRequest.query(dataQuery);

    return {
      data: dataResult.recordset,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async findById(id: number): Promise<Product | null> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query(`
        SELECT p.*, c.name AS category_name
        FROM Products p
        LEFT JOIN Categories c ON p.category_id = c.id
        WHERE p.id = @id
      `);
    return result.recordset[0] || null;
  }

  static async create(
    name: string,
    description: string | null,
    categoryId: number,
    price: number,
    imageUrl: string | null
  ): Promise<Product> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('category_id', sql.Int, categoryId)
      .input('price', sql.Decimal(10, 2), price)
      .input('image_url', sql.NVarChar(500), imageUrl)
      .query(`
        INSERT INTO Products (name, description, category_id, price, image_url)
        OUTPUT INSERTED.*
        VALUES (@name, @description, @category_id, @price, @image_url)
      `);
    return result.recordset[0];
  }

  static async update(
    id: number,
    name: string,
    description: string | null,
    categoryId: number,
    price: number,
    imageUrl?: string | null
  ): Promise<Product | null> {
    const pool = await getPool();

    let query: string;
    const request = pool
      .request()
      .input('id', sql.Int, id)
      .input('name', sql.NVarChar(255), name)
      .input('description', sql.NVarChar(sql.MAX), description)
      .input('category_id', sql.Int, categoryId)
      .input('price', sql.Decimal(10, 2), price);

    if (imageUrl !== undefined) {
      request.input('image_url', sql.NVarChar(500), imageUrl);
      query = `
        UPDATE Products
        SET name = @name, description = @description, category_id = @category_id,
            price = @price, image_url = @image_url, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `;
    } else {
      query = `
        UPDATE Products
        SET name = @name, description = @description, category_id = @category_id,
            price = @price, updated_at = GETDATE()
        OUTPUT INSERTED.*
        WHERE id = @id
      `;
    }

    const result = await request.query(query);
    return result.recordset[0] || null;
  }

  static async delete(id: number): Promise<boolean> {
    const pool = await getPool();
    const result = await pool
      .request()
      .input('id', sql.Int, id)
      .query('DELETE FROM Products WHERE id = @id');
    return (result.rowsAffected[0] || 0) > 0;
  }
}
