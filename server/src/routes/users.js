import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { updateProfile, changePassword, addAddress, deleteAddress } from '../controllers/userController.js';

const router = Router();
router.use(protect);
router.put('/profile', updateProfile);
router.put('/password', changePassword);
router.post('/addresses', addAddress);
router.delete('/addresses/:id', deleteAddress);

export default router;