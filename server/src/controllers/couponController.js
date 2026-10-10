import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../middleware/error.js';
import { applyCoupon } from '../utils/pricing.js';
import httpError from '../utils/httpError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { discount } = await applyCoupon(req.body.code, Number(req.body.amount) || 0);
  res.json({ discount });
});

export const listCoupons = asyncHandler(async (req, res) => res.json(await Coupon.find().sort('-createdAt')));

