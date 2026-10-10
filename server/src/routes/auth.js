import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { register, login, me, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = Router();
router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, me);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);

export default router;