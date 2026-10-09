import Coupon from '../models/Coupon.js';
import Product from '../models/Product.js';
import httpError from './httpError.js';

export async function applyCoupon(code, itemsPrice) {
  if (!code) return { discount: 0, coupon: null };
  const c = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });
  if (!c || (c.expiresAt && c.expiresAt < new Date()) || (c.usageLimit && c.usedCount >= c.usageLimit))
    throw httpError(400, 'Invalid or expired coupon');
  if (itemsPrice < c.minOrder) throw httpError(400, `Minimum order ₹${c.minOrder} required`);
  let d = c.type === 'percent' ? (itemsPrice * c.value) / 100 : c.value;
  if (c.maxDiscount) d = Math.min(d, c.maxDiscount);
  d = Math.min(Math.round(d * 100) / 100, itemsPrice);
  return { discount: d, coupon: c };
}

export const shippingFor = (amount) => (amount >= 999 ? 0 : 49);

export async function restoreStock(order) {
  for (const i of order.items)
    await Product.updateOne({ _id: i.product }, { $inc: { stock: i.qty } });
}