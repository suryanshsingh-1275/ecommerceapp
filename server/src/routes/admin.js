import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { getStats, getCustomers, toggleBlock } from '../controllers/adminController.js';

const router = Router();
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/customers', getCustomers);
router.put('/customers/:id/block', toggleBlock);

export default router;