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

export const myOrders = asyncHandler(async (req, res) =>
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt')));

export const allOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = status ? { status } : {};
  const [orders, total] = await Promise.all([
    Order.find(filter).populate('user', 'name email').sort('-createdAt').skip((page - 1) * limit).limit(Number(limit)),
    Order.countDocuments(filter),
  ]);
  res.json({ orders, total, pages: Math.ceil(total / limit) });
});

export const getOrder = asyncHandler(async (req, res) => {
  const o = await Order.findById(req.params.id).populate('user', 'name email');
  if (!o) throw httpError(404, 'Order not found');
  if (req.user.role !== 'admin' && String(o.user._id) !== String(req.user._id)) throw httpError(403, 'Forbidden');
  res.json(o);
});

export const cancelMyOrder = asyncHandler(async (req, res) => {
  const o = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!o) throw httpError(404, 'Order not found');
  if (!['Pending', 'Confirmed'].includes(o.status)) throw httpError(400, `Cannot cancel an order that is ${o.status}`);
  await cancelOrder(o);
  res.json(o);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'].includes(status)) throw httpError(400, 'Invalid status');
  const o = await Order.findById(req.params.id);
  if (!o) throw httpError(404, 'Order not found');
  if (['Delivered', 'Cancelled'].includes(o.status)) throw httpError(400, `Order already ${o.status}`);
  if (status === 'Cancelled') { await cancelOrder(o); return res.json(o); }
  o.status = status;
  if (status === 'Delivered' && o.paymentMethod === 'COD') { o.paymentStatus = 'Paid'; o.paidAt = new Date(); }
  o.statusHistory.push({ status });
  await o.save();
  res.json(o);
});