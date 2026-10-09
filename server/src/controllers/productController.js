import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Review from '../models/Review.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

const FIELDS = ['name', 'description', 'brand', 'price', 'category', 'stock', 'isActive'];
const pick = (body) => Object.fromEntries(FIELDS.filter((k) => body[k] !== undefined).map((k) => [k, body[k]]));
const rmFile = (url) => fs.unlink(path.join('uploads', path.basename(url || '')), () => {});

// Public listing: search, filter, sort, paginate
export const listProducts = asyncHandler(async (req, res) => {
  const { q, category, minPrice, maxPrice, rating, sort = 'newest', page = 1, limit = 12 } = req.query;
  const filter = { isActive: true };
  if (q) filter.$text = { $search: q };
  if (category) {
    const subs = await Category.find({ parent: category }).distinct('_id');
    filter.category = { $in: [category, ...subs] };
  }
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (rating) filter.ratings = { $gte: Number(rating) };
  const sorts = { newest: '-createdAt', price_asc: 'price', price_desc: '-price', rating: '-ratings' };
  const skip = (Number(page) - 1) * Number(limit);
  const [products, total] = await Promise.all([
    Product.find(filter).populate('category', 'name').sort(sorts[sort] || '-createdAt').skip(skip).limit(Number(limit)),
    Product.countDocuments(filter),
  ]);
  res.json({ products, total, pages: Math.ceil(total / limit), page: Number(page) });
});

export const adminListProducts = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.lowStock) filter.stock = { $lte: 5 };
  if (req.query.q) filter.name = new RegExp(req.query.q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  res.json(await Product.find(filter).populate('category', 'name').sort('-createdAt'));
});

export const getProduct = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category', 'name');
  if (!p || !p.isActive) throw httpError(404, 'Product not found');
  res.json(p);
});

export const createProduct = asyncHandler(async (req, res) =>
  res.status(201).json(await Product.create(pick(req.body))));

export const updateProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndUpdate(req.params.id, pick(req.body), { new: true, runValidators: true });
  if (!p) throw httpError(404, 'Product not found');
  res.json(p);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const p = await Product.findByIdAndDelete(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  p.images.forEach(rmFile);
  res.json({ message: 'Deleted' });
});

export const addImages = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  p.images.push(...req.files.map((f) => `/uploads/${f.filename}`));
  await p.save();
  res.json(p);
});

export const removeImage = asyncHandler(async (req, res) => {
  const p = await Product.findById(req.params.id);
  if (!p) throw httpError(404, 'Product not found');
  p.images = p.images.filter((u) => u !== req.body.url);
  await p.save();
  rmFile(req.body.url);
  res.json(p);
});

export const getReviews = asyncHandler(async (req, res) =>
  res.json(await Review.find({ product: req.params.id }).populate('user', 'name').sort('-createdAt')));

export const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  if (!(rating >= 1 && rating <= 5)) throw httpError(400, 'Rating must be 1-5');
  if (!(await Product.exists({ _id: req.params.id }))) throw httpError(404, 'Product not found');
  await Review.findOneAndUpdate(
    { user: req.user._id, product: req.params.id },
    { rating, comment },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  const [agg] = await Review.aggregate([
    { $match: { product: new mongoose.Types.ObjectId(req.params.id) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } },
  ]);
  await Product.findByIdAndUpdate(req.params.id, { ratings: Math.round(agg.avg * 10) / 10, numReviews: agg.n });
  res.status(201).json({ message: 'Review saved' });
});