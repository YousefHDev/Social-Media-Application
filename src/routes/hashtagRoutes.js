import express from 'express';
import { getHashtagPosts, getTrendingHashtags } from '../controllers/hashtagController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/trending', getTrendingHashtags);
router.get('/:tag', optionalAuth, getHashtagPosts);

export default router;
