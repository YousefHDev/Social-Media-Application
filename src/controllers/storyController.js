import Story from '../models/Story.js';
import Follow from '../models/Follow.js';
import { createNotification } from '../utils/notificationService.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const activeFilter = () => ({ expiresAt: { $gt: new Date() } });

const serializeStory = (story, userId) => {
  const storyObject = story.toObject ? story.toObject() : story;
  const views = storyObject.views || [];
  const reactions = storyObject.reactions || [];
  const ownReaction = reactions.find((reaction) => reaction.user.toString() === userId);

  return {
    ...storyObject,
    viewCount: views.length,
    hasViewed: views.some((view) => view.user.toString() === userId),
    myReaction: ownReaction ? ownReaction.type : null,
    reactionCounts: reactions.reduce((counts, reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      return counts;
    }, {})
  };
};

export const createStory = async (req, res, next) => {
  try {
    if (!req.file) return sendError(res, 400, 'Please select an image or video for your story.');
    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image';
    const caption = typeof req.body.caption === 'string' ? req.body.caption.trim() : '';

    const story = await Story.create({
      author: req.user.userId,
      mediaUrl: `/uploads/${req.file.filename}`,
      mediaType,
      caption,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    });
    await story.populate('author', 'name avatar');

    return sendSuccess(res, 201, 'Story published successfully', {
      story: serializeStory(story, req.user.userId)
    });
  } catch (error) {
    next(error);
  }
};

export const getActiveStories = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const followedIds = await Follow.find({ follower: userId }).distinct('following');
    const authorIds = [...followedIds, userId];
    const stories = await Story.find({ ...activeFilter(), author: { $in: authorIds } })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar');

    const grouped = new Map();
    stories.forEach((story) => {
      const authorId = story.author._id.toString();
      if (!grouped.has(authorId)) grouped.set(authorId, []);
      grouped.get(authorId).push(serializeStory(story, userId));
    });

    return sendSuccess(res, 200, 'Active stories fetched successfully', {
      stories: Array.from(grouped.values()).map((authorStories) => ({
        author: authorStories[0].author,
        stories: authorStories
      }))
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStories = async (req, res, next) => {
  try {
    const stories = await Story.find({ ...activeFilter(), author: req.params.userId })
      .sort({ createdAt: 1 })
      .populate('author', 'name avatar');
    return sendSuccess(res, 200, 'User stories fetched successfully', {
      stories: stories.map((story) => serializeStory(story, req.user.userId))
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStory = async (req, res, next) => {
  try {
    const story = await Story.findOneAndDelete({ _id: req.params.id, author: req.user.userId });
    if (!story) return sendError(res, 404, 'Story not found or you are not the owner.');
    return sendSuccess(res, 200, 'Story deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const viewStory = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, ...activeFilter() });
    if (!story) return sendError(res, 404, 'Story not found or expired.');
    if (story.author.toString() !== req.user.userId && !story.views.some((view) => view.user.toString() === req.user.userId)) {
      story.views.push({ user: req.user.userId });
      await story.save();
    }
    return sendSuccess(res, 200, 'Story viewed successfully', {
      story: serializeStory(story, req.user.userId)
    });
  } catch (error) {
    next(error);
  }
};

export const getStoryViewers = async (req, res, next) => {
  try {
    const story = await Story.findOne({ _id: req.params.id, author: req.user.userId })
      .populate('views.user', 'name avatar');
    if (!story) return sendError(res, 404, 'Story not found or you are not the owner.');
    return sendSuccess(res, 200, 'Story viewers fetched successfully', {
      viewCount: story.views.length,
      viewers: story.views
    });
  } catch (error) {
    next(error);
  }
};

export const reactToStory = async (req, res, next) => {
  try {
    const allowedReactions = ['like', 'haha', 'sad', 'angry', 'wow'];
    const { reaction } = req.body;
    if (reaction !== null && !allowedReactions.includes(reaction)) {
      return sendError(res, 400, 'Invalid story reaction.');
    }

    const story = await Story.findOne({ _id: req.params.id, ...activeFilter() });
    if (!story) return sendError(res, 404, 'Story not found or expired.');

    const existingIndex = story.reactions.findIndex(
      (item) => item.user.toString() === req.user.userId
    );
    if (reaction === null) {
      if (existingIndex >= 0) story.reactions.splice(existingIndex, 1);
    } else if (existingIndex >= 0) {
      story.reactions[existingIndex].type = reaction;
      story.reactions[existingIndex].createdAt = new Date();
    } else {
      story.reactions.push({ user: req.user.userId, type: reaction });
    }
    await story.save();

    if (reaction !== null) {
      await createNotification({
        recipient: story.author,
        actor: req.user.userId,
        type: 'like',
        message: `reacted ${reaction} to your story`
      });
    }

    return sendSuccess(res, 200, 'Story reaction updated', {
      story: serializeStory(story, req.user.userId)
    });
  } catch (error) {
    next(error);
  }
};
