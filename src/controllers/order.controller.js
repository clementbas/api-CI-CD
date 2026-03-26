import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import Cart from '../models/Cart.js';
import Fruit from '../models/Fruit.js';
import Order from '../models/Order.js';

const createOrderFromCart = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.fruit');
  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, 'Cart is empty');
  }

  const orderItems = [];
  for (const item of cart.items) {
    const fruit = await Fruit.findById(item.fruit._id);
    if (!fruit || !fruit.isActive) {
      throw new ApiError(400, `Fruit unavailable: ${item.fruit.name}`);
    }
    if (fruit.stock < item.quantity) {
      throw new ApiError(400, `Insufficient stock for ${fruit.name}`);
    }

    fruit.stock -= item.quantity;
    await fruit.save();

    orderItems.push({
      fruit: fruit._id,
      name: fruit.name,
      quantity: item.quantity,
      unitPrice: fruit.price,
      lineTotal: item.quantity * fruit.price
    });
  }

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    subtotal,
    paymentMethod,
    shippingAddress
  });

  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: order
  });
});

const listMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: orders });
});

const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  const isOwner = order.user._id?.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Forbidden');
  }

  res.status(200).json({ success: true, data: order });
});

const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!order) {
    throw new ApiError(404, 'Order not found');
  }

  res.status(200).json({ success: true, message: 'Order status updated', data: order });
});

export { createOrderFromCart, listMyOrders, getOrderById, updateOrderStatus };
