import { Router } from 'express';
import { body } from 'express-validator';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware } from '../middleware/auth';
import { validate } from '../middleware/validate';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { env } from '../config/env';

// Ensure upload directory exists
const uploadDir = env.uploadDir;
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `product-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, GIF, and WebP images are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

const router = Router();

// All product routes require authentication
router.use(authMiddleware);

/**
 * POST /api/products
 */
router.post(
  '/',
  upload.single('image'),
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Product name is required.')
      .isLength({ max: 255 })
      .withMessage('Product name must be at most 255 characters.'),
    body('description')
      .optional()
      .trim(),
    body('category_id')
      .notEmpty()
      .withMessage('Category is required.')
      .isInt({ min: 1 })
      .withMessage('Invalid category ID.'),
    body('price')
      .notEmpty()
      .withMessage('Price is required.')
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
  ],
  validate,
  ProductController.create
);

/**
 * GET /api/products
 */
router.get('/', ProductController.getAll);

/**
 * GET /api/products/:id
 */
router.get('/:id', ProductController.getById);

/**
 * PUT /api/products/:id
 */
router.put(
  '/:id',
  upload.single('image'),
  [
    body('name')
      .optional()
      .trim()
      .isLength({ max: 255 })
      .withMessage('Product name must be at most 255 characters.'),
    body('description')
      .optional()
      .trim(),
    body('category_id')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Invalid category ID.'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a positive number.'),
  ],
  validate,
  ProductController.update
);

/**
 * DELETE /api/products/:id
 */
router.delete('/:id', ProductController.delete);

export default router;
