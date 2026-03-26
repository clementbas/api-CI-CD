import { Router } from 'express';
import { body } from 'express-validator';
import { login, me, register } from '../../controllers/auth.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/register',
  [
    body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters long'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must contain at least 8 characters')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

router.get('/me', protect, me);

export default router;
