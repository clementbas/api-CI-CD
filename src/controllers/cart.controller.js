import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import Cart from '../models/Cart.js';
import Fruit from '../models/Fruit.js';

const calculateTotal = (items) => items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId }).populate('items.fruit');
  if (!cart) {
    cart = await Cart.create({ user: userId, items: [], totalAmount: 0 });
    cart = await Cart.findOne({ user: userId }).populate('items.fruit');
  }
  return cart;
};

const getMyCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ success: true, data: cart });
});

const addItemToCart = asyncHandler(async (req, res) => {
  const { fruitId, quantity } = req.body;

  const fruit = await Fruit.findById(fruitId);
  if (!fruit || !fruit.isActive) {
    throw new ApiError(404, 'Fruit not found');
  }
  if (fruit.stock < quantity) {
    throw new ApiError(400, 'Requested quantity exceeds available stock');
  }

  const cart = await getOrCreateCart(req.user._id);
  const existingItem = cart.items.find((item) => item.fruit._id.toString() === fruitId);

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;
    if (newQuantity > fruit.stock) {
      throw new ApiError(400, 'Requested quantity exceeds available stock');
    }
    existingItem.quantity = newQuantity;
    existingItem.unitPrice = fruit.price;
  } else {
    cart.items.push({
      fruit: fruit._id,
      quantity,
      unitPrice: fruit.price
    });
  }

  cart.totalAmount = calculateTotal(cart.items);
  await cart.save();

  const freshCart = await Cart.findById(cart._id).populate('items.fruit');
  res.status(200).json({ success: true, message: 'Item added to cart', data: freshCart });
});

const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const fruitId = req.params.fruitId;

  const fruit = await Fruit.findById(fruitId);
  if (!fruit || !fruit.isActive) {
    throw new ApiError(404, 'Fruit not found');
  }
  if (quantity > fruit.stock) {
    throw new ApiError(400, 'Requested quantity exceeds available stock');
  }

  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((entry) => entry.fruit._id.toString() === fruitId);

  if (!item) {
    throw new ApiError(404, 'Item not found in cart');
  }

  item.quantity = quantity;
  item.unitPrice = fruit.price;

  cart.totalAmount = calculateTotal(cart.items);
  await cart.save();

  const freshCart = await Cart.findById(cart._id).populate('items.fruit');
  res.status(200).json({ success: true, message: 'Cart item updated', data: freshCart });
});

const removeCartItem = asyncHandler(async (req, res) => {
  const fruitId = req.params.fruitId;

  const cart = await getOrCreateCart(req.user._id);
  const initialLength = cart.items.length;
  cart.items = cart.items.filter((entry) => entry.fruit._id.toString() !== fruitId);

  if (cart.items.length === initialLength) {
    throw new ApiError(404, 'Item not found in cart');
  }

  cart.totalAmount = calculateTotal(cart.items);
  await cart.save();

  const freshCart = await Cart.findById(cart._id).populate('items.fruit');
  res.status(200).json({ success: true, message: 'Item removed from cart', data: freshCart });
});

const clearCart = asyncHandler(async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  cart.totalAmount = 0;
  await cart.save();

  res.status(200).json({ success: true, message: 'Cart cleared', data: cart });
});

export { getMyCart, addItemToCart, updateCartItem, removeCartItem, clearCart };
