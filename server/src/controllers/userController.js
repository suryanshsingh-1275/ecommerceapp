import User from '../models/User.js';
import { asyncHandler } from '../middleware/error.js';
import httpError from '../utils/httpError.js';

export const updateProfile = asyncHandler(async (req, res) => {
  if (req.body.name) req.user.name = req.body.name;
  await req.user.save();
  const u = req.user;
  res.json({ user: { _id: u._id, name: u.name, email: u.email, role: u.role, addresses: u.addresses } });
});

