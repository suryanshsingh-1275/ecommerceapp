import crypto from 'crypto';
import Razorpay from 'razorpay';
import Order from '../models/Order.js';
import Payment from '../models/Payment.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

const live = () => process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET;

export const createPayment = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.orderId, user: req.user._id });
  if (!order) throw httpError(404, 'Order not found');
  if (order.paymentMethod !== 'ONLINE' || order.paymentStatus === 'Paid' || order.status === 'Cancelled')
    throw httpError(400, 'Order is not payable');

  const amount = Math.round(order.totalPrice * 100);
  let gatewayOrderId, keyId;
  if (live()) {
    const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
    const g = await rz.orders.create({ amount, currency: 'INR', receipt: String(order._id) });
    gatewayOrderId = g.id;
    keyId = process.env.RAZORPAY_KEY_ID;
  } else {
    gatewayOrderId = 'mock_' + Date.now();
    keyId = 'mock';
  }
  await Payment.create({ order: order._id, user: req.user._id, gatewayOrderId, amount: order.totalPrice });
  res.json({ keyId, gatewayOrderId, amount, currency: 'INR' });
});

export const verifyPayment = asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const payment = await Payment.findOne({ gatewayOrderId: razorpay_order_id, user: req.user._id });
  if (!payment) throw httpError(404, 'Payment record not found');
  if (payment.status === 'paid') return res.json({ message: 'Already verified' });

  let ok;
  if (live()) {
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`).digest('hex');
    const a = Buffer.from(expected), b = Buffer.from(razorpay_signature || '');
    ok = a.length === b.length && crypto.timingSafeEqual(a, b);
  } else {
    ok = razorpay_order_id.startsWith('mock_');
  }
  if (!ok) {
    payment.status = 'failed';
    await payment.save();
    throw httpError(400, 'Payment verification failed');
  }
  payment.status = 'paid';
  payment.gatewayPaymentId = razorpay_payment_id || 'mock_pay_' + Date.now();
  payment.signature = razorpay_signature;
  await payment.save();

  const order = await Order.findById(payment.order);
  order.paymentStatus = 'Paid';
  order.paidAt = new Date();
  if (order.status === 'Pending') { order.status = 'Confirmed'; order.statusHistory.push({ status: 'Confirmed' }); }
  await order.save();
  res.json({ message: 'Payment verified', order });
});

export const paymentHistory = asyncHandler(async (req, res) =>
  res.json(await Payment.find({ user: req.user._id }).populate('order', 'totalPrice status').sort('-createdAt')));

export const allPayments = asyncHandler(async (req, res) =>
  res.json(await Payment.find().populate('user', 'name email').populate('order', 'totalPrice status').sort('-createdAt').limit(200)));