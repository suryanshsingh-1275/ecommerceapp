import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController.js';

const router = Router();
router.use(protect);
router.get('/', getWishlist);
router.post('/:productId', toggleWishlist);

export default router;