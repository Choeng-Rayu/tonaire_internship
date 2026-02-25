import { Router } from 'express';
import { body } from 'express-validator';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// All category routes require authentication
router.use(authMiddleware);

/**
 * POST /api/categories
 */
router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required.')
      .isLength({ max: 255 })
      .withMessage('Category name must be at most 255 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters.'),
  ],
  validate,
  CategoryController.create
);

/**
 * GET /api/categories
 */
router.get('/', CategoryController.getAll);

/**
 * GET /api/categories/:id
 */
router.get('/:id', CategoryController.getById);

/**
 * PUT /api/categories/:id
 */
router.put(
  '/:id',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Category name is required.')
      .isLength({ max: 255 })
      .withMessage('Category name must be at most 255 characters.'),
    body('description')
      .optional()
      .trim()
      .isLength({ max: 5000 })
      .withMessage('Description must be at most 5000 characters.'),
  ],
  validate,
  CategoryController.update
);

/**
 * DELETE /api/categories/:id
 */
router.delete('/:id', CategoryController.delete);

export default router;
