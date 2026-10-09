import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';
import sendEmail from '../utils/sendEmail.js';

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (u) => ({ _id: u._id, name: u.name, email: u.email, role: u.role, addresses: u.addresses });
const hash = (t) => crypto.createHash('sha256').update(t).digest('hex');

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password || password.length < 6)
    throw httpError(400, 'Name, email and password (min 6 chars) are required');
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(400, 'Email already registered');
  const user = await User.create({ name, email, password }); // role is never taken from the request
  res.status(201).json({ token: sign(user._id), user: safe(user) });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email: (email || '').toLowerCase() }).select('+password');
  if (!user || !(await user.matchPassword(password || ''))) throw httpError(401, 'Invalid email or password');
  if (user.isBlocked) throw httpError(403, 'Account is blocked');
  res.json({ token: sign(user._id), user: safe(user) });
});

export const me = (req, res) => res.json({ user: safe(req.user) });

