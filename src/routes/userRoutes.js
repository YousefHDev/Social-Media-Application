import express from 'express';
import { updateProfile, updateAvatar, getUserProfile } from '../controllers/userController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { uploadAvatar } from '../middleware/uploadMiddleware.js';
import { updateProfileSchema } from '../utils/validators.js';

const router = express.Router();

router.put('/profile', protect, validateBody(updateProfileSchema), updateProfile);
router.post('/avatar', protect, uploadAvatar.single('avatar'), updateAvatar);
router.get('/:id', optionalAuth, getUserProfile);

export default router;
