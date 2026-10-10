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

