import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: String, image: String, price: Number, qty: Number,
  }],
  shippingAddress: {
    name: String, phone: String, line1: String, line2: String,
    city: String, state: String, pincode: String,
  },
  itemsPrice: Number,
  discount: { type: Number, default: 0 },
  shippingPrice: { type: Number, default: 0 },
  totalPrice: Number,
  couponCode: String,
  paymentMethod: { type: String, enum: ['COD', 'ONLINE'], default: 'COD' },
  paymentStatus: { type: String, enum: ['Pending', 'Paid', 'Refund Pending'], default: 'Pending' },
  paidAt: Date,
  status: { type: String, enum: ['Pending', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'], default: 'Pending' },
  statusHistory: [{ status: String, at: { type: Date, default: Date.now } }],
}, { timestamps: true });

export default mongoose.model('Order', schema);