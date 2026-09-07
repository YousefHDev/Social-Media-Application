import express from 'express';
import {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  toggleFreezePost,
  toggleLikePost
} from '../controllers/postController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validateMiddleware.js';
import { createPostSchema, updatePostSchema } from '../utils/validators.js';

const router = express.Router();

router.get('/', getPosts);
router.get('/:id', getPostById);
router.post('/', protect, validateBody(createPostSchema), createPost);
router.put('/:id', protect, validateBody(updatePostSchema), updatePost);
router.delete('/:id', protect, deletePost);
router.patch('/:id/freeze', protect, toggleFreezePost);
router.post('/:id/like', protect, toggleLikePost);

export default router;
