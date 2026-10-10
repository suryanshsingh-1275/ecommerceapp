import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Category from './models/Category.js';
import Product from './models/Product.js';
import Coupon from './models/Coupon.js';

await mongoose.connect(process.env.MONGO_URI);

if (!(await User.findOne({ email: 'admin@shop.com' })))
  await User.create({ name: 'Admin', email: 'admin@shop.com', password: 'Admin@123', role: 'admin' });

if (!(await Category.countDocuments())) {
  const elec = await Category.create({ name: 'Electronics' });
  const fash = await Category.create({ name: 'Fashion' });
  const phones = await Category.create({ name: 'Phones', parent: elec._id });
  const shoes = await Category.create({ name: 'Shoes', parent: fash._id });
  await Product.insertMany([
    { name: 'Nova X Smartphone', brand: 'Nova', price: 24999, stock: 25, category: phones._id, description: '6.5" AMOLED, 128GB, 5000mAh battery.' },
    { name: 'Wireless Earbuds Pro', brand: 'Aurio', price: 3499, stock: 60, category: elec._id, description: 'Noise cancelling, 24h battery.' },
    { name: 'Smart Watch S2', brand: 'Pulse', price: 4999, stock: 3, category: elec._id, description: 'Heart-rate, GPS, 7-day battery.' },
    { name: 'Runner Sneakers', brand: 'Stride', price: 2799, stock: 40, category: shoes._id, description: 'Lightweight everyday running shoes.' },
    { name: 'Classic Denim Jacket', brand: 'Urban', price: 1999, stock: 18, category: fash._id, description: 'Regular fit, 100% cotton.' },
  ]);
}
await Coupon.updateOne({ code: 'WELCOME10' }, { code: 'WELCOME10', type: 'percent', value: 10, maxDiscount: 500, minOrder: 500 }, { upsert: true });

console.log('Seeded. Admin: admin@shop.com / Admin@123  |  Coupon: WELCOME10');
process.exit(0);