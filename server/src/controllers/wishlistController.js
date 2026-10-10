import Wishlist from '../models/Wishlist.js';
import { asyncHandler } from '../middleware/error.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const w = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true })
    .populate({ path: 'products', populate: { path: 'category', select: 'name' } });
  res.json(w.products);
});

// toggle add/remove
export const toggleWishlist = asyncHandler(async (req, res) => {
  const w = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true });
  const has = w.products.some((p) => String(p) === req.params.productId);
  if (has) w.products.pull(req.params.productId); else w.products.push(req.params.productId);
  await w.save();
  res.json({ wishlisted: !has });
});