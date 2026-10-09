import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { asyncHandler } from './error.js';
import httpError from '../utils/httpError.js';

export const protect = asyncHandler(async (req, res, next) => {
  const h = req.headers.authorization || '';
  if (!h.startsWith('Bearer ')) throw httpError(401, 'Not authenticated');
  let decoded;
  try {
    decoded = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
  } catch {
    throw httpError(401, 'Invalid or expired token');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, 'User no longer exists');
  if (user.isBlocked) throw httpError(403, 'Account is blocked');
  req.user = user;
  next();
});

export const authorize = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : next(httpError(403, 'Forbidden'));