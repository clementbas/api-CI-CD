import { Router } from 'express';
import authRoutes from './auth.routes.js';
import fruitRoutes from './fruit.routes.js';
import cartRoutes from './cart.routes.js';
import orderRoutes from './order.routes.js';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy' });
});

router.use('/auth', authRoutes);
router.use('/fruits', fruitRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);

export default router;
