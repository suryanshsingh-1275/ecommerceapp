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

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase() });
  if (user) {
    const token = crypto.randomBytes(32).toString('hex');
    user.resetToken = hash(token);
    user.resetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();
    const link = `${process.env.CLIENT_URL}/reset-password/${token}`;
    await sendEmail({ to: user.email, subject: 'Password reset', text: `Reset your password (valid 15 min): ${link}` });
  }
  res.json({ message: 'If that email exists, a reset link has been sent' });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  if (!password || password.length < 6) throw httpError(400, 'Password must be at least 6 characters');
  const user = await User.findOne({
    resetToken: hash(req.params.token),
    resetExpires: { $gt: Date.now() },
  }).select('+resetToken +resetExpires');
  if (!user) throw httpError(400, 'Reset link is invalid or expired');
  user.password = password;
  user.resetToken = undefined;
  user.resetExpires = undefined;
  await user.save();
  res.json({ message: 'Password updated. You can log in now.' });
});