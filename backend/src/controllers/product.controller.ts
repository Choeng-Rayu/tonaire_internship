import { Request, Response } from 'express';
import { ProductModel } from '../models/product.model';
import { CategoryModel } from '../models/category.model';
import { sendSuccess, sendError } from '../utils/response';
import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

export class ProductController {
  /**
   * POST /api/products
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, category_id, price } = req.body;

      // Validate category exists
      const category = await CategoryModel.findById(parseInt(category_id, 10));
      if (!category) {
        sendError(res, 'Category not found.', 404);
        return;
      }

      // Handle image upload
      const imageUrl = req.file ? req.file.filename : null;

      const product = await ProductModel.create(
        name,
        description || null,
        parseInt(category_id, 10),
        parseFloat(price),
        imageUrl
      );

      sendSuccess(res, 'Product created successfully.', product, 201);
    } catch (error) {
      console.error('Create product error:', error);
      sendError(res, 'Failed to create product.', 500);
    }
  }

  /**
   * GET /api/products
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string, 10) || 1;
      const limit = parseInt(req.query.limit as string, 10) || 20;
      const sortBy = (req.query.sort_by as string) || 'name';
      const sortOrder = (req.query.sort_order as string) || 'asc';
      const search = req.query.search as string | undefined;
      const categoryId = req.query.category_id
        ? parseInt(req.query.category_id as string, 10)
        : undefined;

      const result = await ProductModel.findAll({
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        categoryId,
      });

      sendSuccess(res, 'Products fetched successfully.', result);
    } catch (error) {
      console.error('Get products error:', error);
      sendError(res, 'Failed to fetch products.', 500);
    }
  }

  /**
   * GET /api/products/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid product ID.', 400);
        return;
      }

      const product = await ProductModel.findById(id);
      if (!product) {
        sendError(res, 'Product not found.', 404);
        return;
      }

      sendSuccess(res, 'Product fetched successfully.', product);
    } catch (error) {
      console.error('Get product error:', error);
      sendError(res, 'Failed to fetch product.', 500);
    }
  }

  /**
   * PUT /api/products/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid product ID.', 400);
        return;
      }

      const existing = await ProductModel.findById(id);
      if (!existing) {
        sendError(res, 'Product not found.', 404);
        return;
      }

      const { name, description, category_id, price } = req.body;

      // Validate category if provided
      if (category_id) {
        const category = await CategoryModel.findById(parseInt(category_id, 10));
        if (!category) {
          sendError(res, 'Category not found.', 404);
          return;
        }
      }

      // Handle image upload (optional on update)
      let imageUrl: string | null | undefined;
      if (req.file) {
        imageUrl = req.file.filename;
        // Delete old image if exists
        if (existing.image_url) {
          const oldPath = path.join(env.uploadDir, existing.image_url);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      }

      const updated = await ProductModel.update(
        id,
        name || existing.name,
        description !== undefined ? description : existing.description,
        category_id ? parseInt(category_id, 10) : existing.category_id,
        price !== undefined ? parseFloat(price) : existing.price,
        imageUrl
      );

      sendSuccess(res, 'Product updated successfully.', updated);
    } catch (error) {
      console.error('Update product error:', error);
      sendError(res, 'Failed to update product.', 500);
    }
  }

  /**
   * DELETE /api/products/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid product ID.', 400);
        return;
      }

      const existing = await ProductModel.findById(id);
      if (!existing) {
        sendError(res, 'Product not found.', 404);
        return;
      }

      // Delete image file if exists
      if (existing.image_url) {
        const imagePath = path.join(env.uploadDir, existing.image_url);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await ProductModel.delete(id);
      sendSuccess(res, 'Product deleted successfully.');
    } catch (error) {
      console.error('Delete product error:', error);
      sendError(res, 'Failed to delete product.', 500);
    }
  }
}
