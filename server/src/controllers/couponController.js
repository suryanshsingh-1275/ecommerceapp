import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../middleware/error.js';
import { applyCoupon } from '../utils/pricing.js';
import httpError from '../utils/httpError.js';

export const validateCoupon = asyncHandler(async (req, res) => {
  const { discount } = await applyCoupon(req.body.code, Number(req.body.amount) || 0);
  res.json({ discount });
});

export const listCoupons = asyncHandler(async (req, res) => res.json(await Coupon.find().sort('-createdAt')));

export const createCoupon = asyncHandler(async (req, res) => res.status(201).json(await Coupon.create(req.body)));

export const updateCoupon = asyncHandler(async (req, res) => {
  const c = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!c) throw httpError(404, 'Coupon not found');
  res.json(c);
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted' });
});