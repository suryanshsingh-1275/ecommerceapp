import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

export const getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 29 * 864e5);
  since.setHours(0, 0, 0, 0);
  const notCancelled = { status: { $ne: 'Cancelled' } };
  const [rev, daily, byStatus, top, customers, products, lowStock, orders] = await Promise.all([
    Order.aggregate([{ $match: { paymentStatus: 'Paid', ...notCancelled } }, { $group: { _id: null, total: { $sum: '$totalPrice' } } }]),
    Order.aggregate([
      { $match: { createdAt: { $gte: since }, ...notCancelled } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, revenue: { $sum: '$totalPrice' }, orders: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Order.aggregate([
      { $match: notCancelled }, { $unwind: '$items' },
      { $group: { _id: '$items.name', sold: { $sum: '$items.qty' }, revenue: { $sum: { $multiply: ['$items.price', '$items.qty'] } } } },
      { $sort: { sold: -1 } }, { $limit: 5 },
    ]),
    User.countDocuments({ role: 'customer' }),
    Product.countDocuments(),
    Product.find({ stock: { $lte: 5 }, isActive: true }).select('name stock').limit(10),
    Order.countDocuments(),
  ]);
  res.json({
    kpis: { revenue: rev[0]?.total || 0, orders, customers, products },
    daily: daily.map((d) => ({ date: d._id.slice(5), revenue: d.revenue, orders: d.orders })),
    byStatus: byStatus.map((s) => ({ name: s._id, value: s.count })),
    top: top.map((t) => ({ name: t._id, sold: t.sold, revenue: t.revenue })),
    lowStock,
  });
});


export const getCustomers = asyncHandler(async (req, res) => {
  const [users, agg] = await Promise.all([
    User.find({ role: 'customer' }).sort('-createdAt').lean(),
    Order.aggregate([{ $match: { status: { $ne: 'Cancelled' } } }, { $group: { _id: '$user', orders: { $sum: 1 }, spent: { $sum: '$totalPrice' } } }]),
  ]);
  const m = Object.fromEntries(agg.map((a) => [String(a._id), a]));
  res.json(users.map((u) => ({ ...u, orders: m[String(u._id)]?.orders || 0, spent: m[String(u._id)]?.spent || 0 })));
});

export const toggleBlock = asyncHandler(async (req, res) => {
  const u = await User.findOne({ _id: req.params.id, role: 'customer' });
  if (!u) throw httpError(404, 'Customer not found');
  u.isBlocked = !u.isBlocked;
  await u.save();
  res.json({ isBlocked: u.isBlocked });
});