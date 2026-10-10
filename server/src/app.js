import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { notFound, errorHandler } from './middleware/error.js';
import auth from './routes/auth.js';
import users from './routes/users.js';
import categories from './routes/categories.js';
import products from './routes/products.js';
import cart from './routes/cart.js';
import wishlist from './routes/wishlist.js';
import coupons from './routes/coupons.js';
import orders from './routes/orders.js';
import payments from './routes/payments.js';
import admin from './routes/admin.js';

const app = express();
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve('uploads')));

app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }), auth);
app.use('/api/users', users);
app.use('/api/categories', categories);
app.use('/api/products', products);
app.use('/api/cart', cart);
app.use('/api/wishlist', wishlist);
app.use('/api/coupons', coupons);
app.use('/api/orders', orders);
app.use('/api/payments', payments);
app.use('/api/admin', admin);

app.use(notFound);
app.use(errorHandler);
export default app;