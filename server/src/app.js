import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
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

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, '../../client/dist'); // e-commerce-website/client/dist
const indexHtml = path.join(clientDist, 'index.html');

const app = express();
app.set('trust proxy', 1); // Render sits behind a proxy

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", 'https://checkout.razorpay.com'],
      frameSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com'],
      connectSrc: ["'self'", 'https://api.razorpay.com', 'https://checkout.razorpay.com', 'https://lumberjack.razorpay.com'],
      imgSrc: ["'self'", 'data:', 'https:'],
      styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
      fontSrc: ["'self'", 'data:', 'https:'],
      upgradeInsecureRequests: null,
    },
  },
}));
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static(path.resolve('uploads')));

// ---- API routes (must come before the frontend fallback) ----
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

// ---- Serve the React build (only if it exists, so local dev still works) ----
if (fs.existsSync(indexHtml)) {
  app.use(express.static(clientDist));
  // React Router fallback: works on Express 4 and 5 (no wildcard syntax)
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(indexHtml);
  });
}

app.use(notFound);
app.use(errorHandler);
export default app;