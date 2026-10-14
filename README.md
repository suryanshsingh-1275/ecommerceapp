# Enterprise E-Commerce & Order Management Platform

A full-stack e-commerce platform where customers can browse products, manage a cart, place orders, pay online and track orders, while admins manage products, inventory, customers, orders and view sales analytics.

**Live demo:** _add your Render URL here_
**Admin demo login:** `admin@shop.com` / `Admin@123`

## Features

**Customer**
- Register, login, JWT authentication, forgot/reset password
- Profile, change password, multiple saved addresses
- Product listing with search, category/subcategory filter, price range, rating filter, sorting and pagination
- Product detail page with image gallery, reviews and ratings
- Shopping cart and wishlist
- Coupon codes, checkout, COD or online payment (Razorpay)
- Order history, order cancellation, order tracking timeline, transaction history

**Admin**
- Dashboard with KPIs and charts (sales trend, orders by status, top products)
- Product CRUD with multi-image upload
- Inventory management and low-stock alerts
- Order management with status updates
- Customer management (block/unblock)
- Coupon management
- Role-based access control

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios, Recharts |
| Backend | Node.js, Express.js, REST API |
| Database | MongoDB (Mongoose) |
| Auth | JWT, bcrypt, role-based access control |
| Payments | Razorpay (with a mock mode for demos) |
| DevOps | Docker, Docker Compose, Git/GitHub, Render |

## Project Structure

```
e-commerce-website/
├── docker-compose.yml
├── client/                  # React (Vite) frontend
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── public/products/     # seed product images
│   └── src/
│       ├── api.js, utils.js, main.jsx, App.jsx, index.css
│       ├── context/         # AuthContext, CartContext
│       ├── components/      # Navbar, ProtectedRoute, ProductCard
│       └── pages/           # shop, cart, checkout, orders, auth, admin/*
└── server/                  # Express backend
    ├── Dockerfile
    └── src/
        ├── server.js, app.js, seed.js
        ├── config/          # db connection
        ├── middleware/      # auth, error handling, upload
        ├── utils/           # pricing, email, errors
        ├── models/          # User, Product, Category, Cart, Order, Payment...
        ├── controllers/     # business logic
        └── routes/          # API routes
```

## Run Locally

**Prerequisites:** Node.js 18+, and MongoDB running locally or a MongoDB Atlas connection string.

**1. Clone**
```bash
git clone https://github.com/suryanshsingh-1275/ecommerceapp.git
cd ecommerceapp
```

**2. Backend**
```bash
cd server
cp .env.example .env      # on Windows: copy .env.example .env
npm install
npm run seed
npm run dev
```

**3. Frontend** (new terminal)
```bash
cd client
npm install
npm run dev
```

Open **http://localhost:5173**.

> The port in `client/vite.config.js` (dev proxy) must match `PORT` in `server/.env`.

## Environment Variables (`server/.env`)

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ecommerce
JWT_SECRET=change_this_to_a_long_random_string
CLIENT_URL=http://localhost:5173

# Leave blank to use mock payments in development
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

# Leave blank to print password-reset links in the server console
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
MAIL_FROM=shop@example.com
```

## Seed Data

`npm run seed` (inside `server/`) creates:
- Admin user: `admin@shop.com` / `Admin@123`
- Sample categories and products
- Coupon: `WELCOME10` (10% off, max ₹500, min order ₹500)

It is safe to run more than once.

## Payments

- **Real payments:** set `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`. Signatures are verified with HMAC SHA256.
- **Demo mode:** leave the keys blank. Online payments are simulated and marked as paid. In production this is disabled unless `ALLOW_MOCK_PAYMENTS=true` is set.

## Deploy on Render (single Web Service)

Express serves the React build, so frontend and backend run as one service.

| Setting | Value |
|---|---|
| Root Directory | _(blank)_ |
| Build Command | `npm install --include=dev --prefix client && npm run build --prefix client && npm install --prefix server` |
| Start Command | `cd server && npm start` |

**Environment variables on Render**

```
NODE_ENV=production
NODE_VERSION=20
MONGO_URI=<MongoDB Atlas connection string, ending in /ecommerce>
JWT_SECRET=<long random string>
CLIENT_URL=https://<your-service>.onrender.com
ALLOW_MOCK_PAYMENTS=true      # only for demos without Razorpay keys
```

Seed the Atlas database once from your machine:
```bash
# PowerShell
$env:MONGO_URI="<atlas-uri>"; npm run seed
```

> Render's filesystem is ephemeral, so images uploaded through the admin panel are lost on redeploy. Use a persistent disk or cloud storage for permanent uploads.

