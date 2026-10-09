import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

export const listCategories = asyncHandler(async (req, res) => res.json(await Category.find().sort('name')));

export const createCategory = asyncHandler(async (req, res) =>
  res.status(201).json(await Category.create({ name: req.body.name, parent: req.body.parent || null })));

export const updateCategory = asyncHandler(async (req, res) => {
  const c = await Category.findById(req.params.id);
  if (!c) throw httpError(404, 'Category not found');
  c.name = req.body.name || c.name;
  c.parent = req.body.parent === undefined ? c.parent : req.body.parent || null;
  await c.save();
  res.json(c);
});

