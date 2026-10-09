import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.name) req.user.name = req.body.name;
  await req.user.save();
  const u = req.user;
  res.json({ user: { _id: u._id, name: u.name, email: u.email, role: u.role, addresses: u.addresses } });
});

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!newPassword || newPassword.length < 6) throw httpError(400, 'New password must be at least 6 characters');
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw httpError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password changed' });
});

