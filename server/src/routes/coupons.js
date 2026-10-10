import { Router } from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { validateCoupon, listCoupons, createCoupon, updateCoupon, deleteCoupon } from '../controllers/couponController.js';

const router = Router();
router.use(protect);
router.post('/validate', validateCoupon);

router.use(authorize('admin'));
router.get('/', listCoupons);
router.post('/', createCoupon);
router.put('/:id', updateCoupon);
router.delete('/:id', deleteCoupon);

export default router;