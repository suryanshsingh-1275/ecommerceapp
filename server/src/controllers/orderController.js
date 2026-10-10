import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { asyncHandler } from '../middleware/error.js';
import { applyCoupon, shippingFor, restoreStock } from '../utils/pricing.js';
import httpError from '../utils/httpError.js';

const cancelOrder = async (o) => {
  await restoreStock(o);
  o.status = 'Cancelled';
  if (o.paymentStatus === 'Paid') o.paymentStatus = 'Refund Pending';
  o.statusHistory.push({ status: 'Cancelled' });
  await o.save();
};

export const placeOrder = asyncHandler(async (req, res) => {
  const { address, paymentMethod = 'COD', couponCode } = req.body;
  if (!address || ['name', 'phone', 'line1', 'city', 'state', 'pincode'].some((k) => !address[k]))
    throw httpError(400, 'Complete shipping address is required');
  if (!['COD', 'ONLINE'].includes(paymentMethod)) throw httpError(400, 'Invalid payment method');

  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');
  const lines = (cart?.items || []).filter((i) => i.product && i.product.isActive);
  if (!lines.length) throw httpError(400, 'Cart is empty');

  const items = lines.map((i) => ({
    product: i.product._id, name: i.product.name, image: i.product.images[0] || '',
    price: i.product.price, qty: i.qty,
  }));
  const itemsPrice = items.reduce((s, i) => s + i.price * i.qty, 0);
  const { discount, coupon } = await applyCoupon(couponCode, itemsPrice);
  const shippingPrice = shippingFor(itemsPrice - discount);
  const totalPrice = itemsPrice - discount + shippingPrice;

  // Reserve stock atomically per product; roll back on any failure
  const reserved = [];
  let order;
  try {
    for (const i of items) {
      const r = await Product.updateOne({ _id: i.product, stock: { $gte: i.qty } }, { $inc: { stock: -i.qty } });
      if (!r.modifiedCount) throw httpError(400, `Insufficient stock for ${i.name}`);
      reserved.push(i);
    }
    const status = paymentMethod === 'COD' ? 'Confirmed' : 'Pending';
    order = await Order.create({
      user: req.user._id, items, shippingAddress: address, itemsPrice, discount, shippingPrice, totalPrice,
      couponCode: coupon?.code, paymentMethod, status,
      statusHistory: status === 'Confirmed' ? [{ status: 'Pending' }, { status }] : [{ status }],
    });
  } catch (e) {
    await restoreStock({ items: reserved });
    throw e;
  }
  if (coupon) await Coupon.updateOne({ _id: coupon._id }, { $inc: { usedCount: 1 } });
  await Cart.updateOne({ user: req.user._id }, { $set: { items: [] } });
  res.status(201).json(order);
});

