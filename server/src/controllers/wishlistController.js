import Wishlist from '../models/Wishlist.js';
import { asyncHandler } from '../middleware/error.js';

export const getWishlist = asyncHandler(async (req, res) => {
  const w = await Wishlist.findOneAndUpdate({ user: req.user._id }, { $setOnInsert: { user: req.user._id } }, { upsert: true, new: true })
    .populate({ path: 'products', populate: { path: 'category', select: 'name' } });
  res.json(w.products);
});

// toggle add/remove
