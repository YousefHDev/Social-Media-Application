import express from 'express';
import {
  createStory,
  getActiveStories,
  getUserStories,
  deleteStory,
  viewStory,
  getStoryViewers,
  reactToStory
} from '../controllers/storyController.js';
import { protect } from '../middleware/authMiddleware.js';
import { uploadStory } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect);
router.get('/', getActiveStories);
router.get('/user/:userId', getUserStories);
router.post('/', uploadStory.single('media'), createStory);
router.patch('/:id/view', viewStory);
router.get('/:id/viewers', getStoryViewers);
router.put('/:id/reaction', reactToStory);
router.delete('/:id', deleteStory);

export default router;
