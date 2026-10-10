import { Router } from 'express';
import upload from '../middleware/upload.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  listProducts, adminListProducts, getProduct, createProduct, updateProduct, deleteProduct,
  addImages, removeImage, getReviews, addReview,
} from '../controllers/productController.js';

const router = Router();
const admin = [protect, authorize('admin')];

router.get('/', listProducts);
router.get('/admin/all', ...admin, adminListProducts); // must be before /:id
router.get('/:id', getProduct);
router.post('/', ...admin, createProduct);
router.put('/:id', ...admin, updateProduct);
router.delete('/:id', ...admin, deleteProduct);

router.post('/:id/images', ...admin, upload.array('images', 6), addImages);
router.delete('/:id/images', ...admin, removeImage);

router.get('/:id/reviews', getReviews);
router.post('/:id/reviews', protect, addReview);

export default router;