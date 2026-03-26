import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/apiError.js';
import Fruit from '../models/Fruit.js';
import { getFromCache, setToCache, invalidateByPattern } from '../config/cache.js';

const listFruits = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page || '1', 10), 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit || '10', 10), 1), 100);
  const skip = (page - 1) * limit;

  const search = req.query.search?.trim();
  const inStock = req.query.inStock === 'true';

  const filter = { isActive: true };
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }
  if (inStock) {
    filter.stock = { $gt: 0 };
  }

  const cacheKey = `fruits:${JSON.stringify({ page, limit, search: search || '', inStock })}`;
  const cachedPayload = await getFromCache(cacheKey);

  if (cachedPayload) {
    return res.status(200).json(cachedPayload);
  }

  const [items, total] = await Promise.all([
    Fruit.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Fruit.countDocuments(filter)
  ]);

  const payload = {
    success: true,
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    }
  };

  await setToCache(cacheKey, payload, 300);

  res.status(200).json(payload);
});

const getFruitById = asyncHandler(async (req, res) => {
  const fruit = await Fruit.findById(req.params.id);
  if (!fruit || !fruit.isActive) {
    throw new ApiError(404, 'Fruit not found');
  }

  res.status(200).json({ success: true, data: fruit });
});

const createFruit = asyncHandler(async (req, res) => {
  const fruit = await Fruit.create(req.body);
  await invalidateByPattern('fruits:*');
  res.status(201).json({ success: true, message: 'Fruit created', data: fruit });
});

const updateFruit = asyncHandler(async (req, res) => {
  const fruit = await Fruit.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  if (!fruit) {
    throw new ApiError(404, 'Fruit not found');
  }

  await invalidateByPattern('fruits:*');

  res.status(200).json({ success: true, message: 'Fruit updated', data: fruit });
});

const deleteFruit = asyncHandler(async (req, res) => {
  const fruit = await Fruit.findById(req.params.id);
  if (!fruit) {
    throw new ApiError(404, 'Fruit not found');
  }

  fruit.isActive = false;
  await fruit.save();

  await invalidateByPattern('fruits:*');

  res.status(200).json({ success: true, message: 'Fruit archived' });
});

export { listFruits, getFruitById, createFruit, updateFruit, deleteFruit };
