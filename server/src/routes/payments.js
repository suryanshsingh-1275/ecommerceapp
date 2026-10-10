import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { createPayment, verifyPayment, paymentHistory, allPayments } from '../controllers/paymentController.js';

const router = Router();
router.use(protect);

router.post('/create/:orderId', createPayment);
router.post('/verify', verifyPayment);
router.get('/history', paymentHistory);
router.get('/', authorize('admin'), allPayments);

export default router;