import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { getCart, addToCart, updateCartItem, removeCartItem } from '../controllers/cartController.js';

const router = Router();
router.use(protect);
router.get('/', getCart);
router.post('/', addToCart);
router.put('/:productId', updateCartItem);
router.delete('/:productId', removeCartItem);

export default router;