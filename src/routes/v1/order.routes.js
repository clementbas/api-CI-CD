import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createOrderFromCart,
  getOrderById,
  listMyOrders,
  updateOrderStatus
} from '../../controllers/order.controller.js';
import { authorize, protect } from '../../middlewares/auth.middleware.js';
import validateRequest from '../../middlewares/validateRequest.js';

const router = Router();

router.use(protect);

router.get('/', listMyOrders);

router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid order id')],
  validateRequest,
  getOrderById
);

router.post(
  '/',
  [
    body('paymentMethod').isIn(['card', 'cash', 'paypal']).withMessage('Invalid payment method'),
    body('shippingAddress.line1').trim().notEmpty().withMessage('Address line is required'),
    body('shippingAddress.city').trim().notEmpty().withMessage('City is required'),
    body('shippingAddress.postalCode').trim().notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country').trim().notEmpty().withMessage('Country is required')
  ],
  validateRequest,
  createOrderFromCart
);

router.patch(
  '/:id/status',
  authorize('admin'),
  [
    param('id').isMongoId().withMessage('Invalid order id'),
    body('status')
      .isIn(['pending', 'paid', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  validateRequest,
  updateOrderStatus
);

export default router;
