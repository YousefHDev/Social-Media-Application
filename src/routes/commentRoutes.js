import express from 'express';
import { createComment, getPostComments, deleteComment } from '../controllers/commentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createCommentSchema } from '../utils/validators.js';

const router = express.Router({ mergeParams: true });

router.post('/posts/:postId/comments', protect, validateBody(createCommentSchema), createComment);
router.get('/posts/:postId/comments', getPostComments);
router.delete('/comments/:commentId', protect, deleteComment);

export default router;
