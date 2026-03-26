import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addItemToCart,
  clearCart,
  getMyCart,
  removeCartItem,
  updateCartItem
} from '../../controllers/cart.controller.js';
import { protect } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validateRequest.js';

const router = Router();

router.use(protect);

router.get('/', getMyCart);

router.post(
  '/items',
  [
    body('fruitId').isMongoId().withMessage('Valid fruitId is required'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
  ],
  validateRequest,
  addItemToCart
);

router.patch(
  '/items/:fruitId',
  [
    param('fruitId').isMongoId().withMessage('Invalid fruit id'),
    body('quantity').isInt({ min: 1 }).withMessage('Quantity must be >= 1')
  ],
  validateRequest,
  updateCartItem
);

router.delete(
  '/items/:fruitId',
  [param('fruitId').isMongoId().withMessage('Invalid fruit id')],
  validateRequest,
  removeCartItem
);

router.delete('/clear', clearCart);

export default router;
