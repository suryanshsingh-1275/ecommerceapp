import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  placeOrder, myOrders, allOrders, getOrder, cancelMyOrder, updateOrderStatus,
} from '../controllers/orderController.js';

const router = Router();
router.use(protect);

router.post('/', placeOrder);
router.get('/mine', myOrders); // must be before /:id
router.get('/', authorize('admin'), allOrders);
router.get('/:id', getOrder);
router.put('/:id/cancel', cancelMyOrder);
router.put('/:id/status', authorize('admin'), updateOrderStatus);

export default router;