import express from 'express';
import {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getSuggestedUsers,
  getFollowStatus
} from '../controllers/followController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggested/people', optionalAuth, getSuggestedUsers);
router.post('/:id/follow', protect, followUser);
router.delete('/:id/follow', protect, unfollowUser);
router.get('/:id/followers', optionalAuth, getFollowers);
router.get('/:id/following', optionalAuth, getFollowing);
router.get('/:id/follow-status', optionalAuth, getFollowStatus);

export default router;
