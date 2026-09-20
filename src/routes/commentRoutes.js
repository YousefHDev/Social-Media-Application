import express from 'express';
import {
  createComment,
  getPostComments,
  getCommentReplies,
  updateComment,
  deleteComment,
  toggleLikeComment
} from '../controllers/commentController.js';
import { protect, optionalAuth } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createCommentSchema, updateCommentSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/posts/:postId/comments', protect, validateBody(createCommentSchema), createComment);
router.get('/posts/:postId/comments', optionalAuth, getPostComments);
router.get('/comments/:commentId/replies', optionalAuth, getCommentReplies);
router.patch('/comments/:commentId', protect, validateBody(updateCommentSchema), updateComment);
router.delete('/comments/:commentId', protect, deleteComment);
router.post('/comments/:commentId/like', protect, toggleLikeComment);

export default router;

