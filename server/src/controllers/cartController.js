import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

const load = async (userId) => {
  const cart = await Cart.findOneAndUpdate({ user: userId }, { $setOnInsert: { user: userId } }, { upsert: true, new: true })
    .populate('items.product');
  cart.items = cart.items.filter((i) => i.product && i.product.isActive);
  return cart;
};

export const getCart = asyncHandler(async (req, res) => res.json(await load(req.user._id)));

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, qty = 1 } = req.body;
  const p = await Product.findById(productId);
  if (!p || !p.isActive) throw httpError(404, 'Product not found');
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
  const line = cart.items.find((i) => String(i.product) === productId);
  const next = (line ? line.qty : 0) + Number(qty);
  if (next > p.stock) throw httpError(400, `Only ${p.stock} in stock`);
  if (line) line.qty = next; else cart.items.push({ product: productId, qty: next });
  await cart.save();
  res.json(await load(req.user._id));
});
