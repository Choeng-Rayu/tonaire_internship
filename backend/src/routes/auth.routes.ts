import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validate';

const router = Router();

/**
 * POST /api/auth/signup
 */
router.post(
  '/signup',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required.')
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be between 2 and 100 characters.'),
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required.')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter and one number.'),
  ],
  validate,
  AuthController.signup
);

/**
 * POST /api/auth/login
 */
router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required.'),
  ],
  validate,
  AuthController.login
);

/**
 * POST /api/auth/forgot-password
 */
router.post(
  '/forgot-password',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
  ],
  validate,
  AuthController.forgotPassword
);

/**
 * POST /api/auth/reset-password
 */
router.post(
  '/reset-password',
  [
    body('email')
      .trim()
      .notEmpty()
      .withMessage('Email is required.')
      .isEmail()
      .withMessage('Please provide a valid email address.')
      .normalizeEmail(),
    body('otp')
      .trim()
      .notEmpty()
      .withMessage('OTP is required.')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits.'),
    body('newPassword')
      .notEmpty()
      .withMessage('New password is required.')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters.')
      .matches(/^(?=.*[A-Z])(?=.*\d)/)
      .withMessage('Password must contain at least one uppercase letter and one number.'),
  ],
  validate,
  AuthController.resetPassword
);

export default router;
