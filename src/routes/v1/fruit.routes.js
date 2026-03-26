import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createFruit,
  deleteFruit,
  getFruitById,
  listFruits,
  updateFruit
} from '../../controllers/fruit.controller.js';
import validateRequest from '../../middlewares/validateRequest.js';
import { authorize, protect } from '../../middlewares/auth.middleware.js';

const router = Router();

router.get('/', listFruits);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid fruit id')],
  validateRequest,
  getFruitById
);

router.post(
  '/',
  protect,
  authorize('admin'),
  [
    body('name').trim().notEmpty().withMessage('Fruit name is required'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').isInt({ min: 0 }).withMessage('Stock must be >= 0')
  ],
  validateRequest,
  createFruit
);

router.patch(
  '/:id',
  protect,
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid fruit id'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('stock').optional().isInt({ min: 0 }).withMessage('Stock must be >= 0')
  ],
  validateRequest,
  updateFruit
);

router.delete(
  '/:id',
  protect,
  authorize('admin'),
  [param('id').isMongoId().withMessage('Invalid fruit id')],
  validateRequest,
  deleteFruit
);

export default router;
