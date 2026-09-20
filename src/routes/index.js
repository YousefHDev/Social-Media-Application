import express from 'express';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import postRoutes from './postRoutes.js';
import commentRoutes from './commentRoutes.js';
import followRoutes from './followRoutes.js';
import chatRoutes from './chatRoutes.js';
import notificationRoutes from './notificationRoutes.js';
import storyRoutes from './storyRoutes.js';
import searchRoutes from './searchRoutes.js';
import hashtagRoutes from './hashtagRoutes.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

router.use('/auth', authRoutes);
router.use('/users', followRoutes);
router.use('/users', userRoutes);
router.use('/posts', postRoutes);
router.use('/chat', chatRoutes);
router.use('/notifications', notificationRoutes);
router.use('/stories', storyRoutes);
router.use('/search', searchRoutes);
router.use('/hashtags', hashtagRoutes);
router.use('/', commentRoutes);

export default router;
