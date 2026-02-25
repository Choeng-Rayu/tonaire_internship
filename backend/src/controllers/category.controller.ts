import { Request, Response } from 'express';
import { CategoryModel } from '../models/category.model';
import { sendSuccess, sendError } from '../utils/response';

export class CategoryController {
  /**
   * POST /api/categories
   */
  static async create(req: Request, res: Response): Promise<void> {
    try {
      const { name, description } = req.body;
      const category = await CategoryModel.create(name, description || null);
      sendSuccess(res, 'Category created successfully.', category, 201);
    } catch (error) {
      console.error('Create category error:', error);
      sendError(res, 'Failed to create category.', 500);
    }
  }

  /**
   * GET /api/categories
   */
  static async getAll(req: Request, res: Response): Promise<void> {
    try {
      const search = req.query.search as string | undefined;
      const categories = await CategoryModel.findAll(search);
      sendSuccess(res, 'Categories fetched successfully.', categories);
    } catch (error) {
      console.error('Get categories error:', error);
      sendError(res, 'Failed to fetch categories.', 500);
    }
  }

  /**
   * GET /api/categories/:id
   */
  static async getById(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid category ID.', 400);
        return;
      }

      const category = await CategoryModel.findById(id);
      if (!category) {
        sendError(res, 'Category not found.', 404);
        return;
      }

      sendSuccess(res, 'Category fetched successfully.', category);
    } catch (error) {
      console.error('Get category error:', error);
      sendError(res, 'Failed to fetch category.', 500);
    }
  }

  /**
   * PUT /api/categories/:id
   */
  static async update(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid category ID.', 400);
        return;
      }

      const { name, description } = req.body;

      // Check if category exists
      const existing = await CategoryModel.findById(id);
      if (!existing) {
        sendError(res, 'Category not found.', 404);
        return;
      }

      const updated = await CategoryModel.update(id, name, description || null);
      sendSuccess(res, 'Category updated successfully.', updated);
    } catch (error) {
      console.error('Update category error:', error);
      sendError(res, 'Failed to update category.', 500);
    }
  }

  /**
   * DELETE /api/categories/:id
   */
  static async delete(req: Request, res: Response): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        sendError(res, 'Invalid category ID.', 400);
        return;
      }

      const existing = await CategoryModel.findById(id);
      if (!existing) {
        sendError(res, 'Category not found.', 404);
        return;
      }

      await CategoryModel.delete(id);
      sendSuccess(res, 'Category deleted successfully.');
    } catch (error) {
      console.error('Delete category error:', error);
      sendError(res, 'Failed to delete category.', 500);
    }
  }
}
