import express from 'express';
import { signup, login, refreshToken, logout, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { authLimiter } from '../middleware/rateLimitMiddleware.js';
import { signupSchema, loginSchema, refreshTokenSchema } from '../utils/validators.js';

const router = express.Router();

router.post('/signup', authLimiter, validateBody(signupSchema), signup);
router.post('/login', authLimiter, validateBody(loginSchema), login);
router.post('/refresh', validateBody(refreshTokenSchema), refreshToken);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);

export default router;
