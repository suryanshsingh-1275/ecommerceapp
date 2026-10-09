import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

export const listCategories = asyncHandler(async (req, res) => res.json(await Category.find().sort('name')));

export const createCategory = asyncHandler(async (req, res) =>
  res.status(201).json(await Category.create({ name: req.body.name, parent: req.body.parent || null })));

