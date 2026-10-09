import mongoose from 'mongoose';

const schema = new mongoose.Schema({
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  gatewayOrderId: { type: String, required: true, index: true },
  gatewayPaymentId: String,
  signature: String,
  amount: Number,
  status: { type: String, enum: ['created', 'paid', 'failed'], default: 'created' },
}, { timestamps: true });

export default mongoose.model('Payment', schema);