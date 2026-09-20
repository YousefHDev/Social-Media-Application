import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { createNotification } from '../utils/notificationService.js';
import { getPostHashtags } from '../utils/hashtags.js';

const reactionTypes = ['like', 'haha', 'sad', 'angry', 'wow'];

export const getPostReactionState = (post, userId) => {
  const reactions = post.reactions || [];
  const reactionUsers = new Set(reactions.map((reaction) => reaction.user.toString()));
  const legacyLikes = (post.likes || [])
    .filter((like) => !reactionUsers.has(like.toString()))
    .map((user) => ({ user, type: 'like' }));
  const allReactions = [...reactions, ...legacyLikes];
  const reactionCounts = allReactions.reduce((counts, reaction) => {
    counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    return counts;
  }, {});
  const currentReaction = allReactions.find(
    (reaction) => reaction.user.toString() === userId
  );

  return {
    totalReactions: allReactions.length,
    reactionCounts,
    myReaction: currentReaction ? currentReaction.type : null
  };
};

export const formatPost = (post, userId) => ({
  ...(post.toJSON ? post.toJSON() : post),
  ...getPostReactionState(post, userId)
});

export const createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;
    const authorId = req.user.userId;

    const post = new Post({
      author: authorId,
      content,
      tags: getPostHashtags(content, tags)
    });

    await post.save();
    await post.populate('author', 'name email avatar bio');

    return sendSuccess(res, 201, 'Post created successfully', { post });
  } catch (error) {
    next(error);
  }
};

export const getPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    const { search, tag, author, isFrozen, sortBy, feedType } = req.query;

    // Build query filters
    const query = {};

    // Handle Personalized Following Feed vs Global Feed
    if (feedType === 'following') {
      if (req.user && req.user.userId) {
        const followedUserIds = await Follow.find({ follower: req.user.userId }).distinct('following');
        // Include followed users + current user's own posts
        const targetAuthors = [...followedUserIds, req.user.userId];
        query.author = { $in: targetAuthors };
      } else {
        // Unauthenticated user requesting following feed returns empty result set
        query.author = null;
      }
    } else if (author) {
      query.author = author;
    }

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (isFrozen !== undefined) {
      query.isFrozen = isFrozen === 'true';
    }

    // Build sort options
    let sortOptions = { createdAt: -1 }; // default latest
    if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else if (sortBy === 'popular') {
      sortOptions = { likeCount: -1, createdAt: -1 };
    }

    const total = await Post.countDocuments(query);

    const posts = await Post.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email avatar bio');
    const followedUserIds = req.user
      ? await Follow.find({ follower: req.user.userId }).distinct('following')
      : [];
    const followedUsers = new Set(followedUserIds.map((id) => id.toString()));

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 200, 'Posts fetched successfully', {
      posts: posts.map((post) => ({
        ...formatPost(post, req.user ? req.user.userId : ''),
        isFollowing: req.user
          ? followedUsers.has(post.author._id.toString())
          : false
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasMore: page < totalPages
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('author', 'name email avatar bio')
      .populate({
        path: 'comments',
        populate: {
          path: 'author',
          select: 'name email avatar bio'
        }
      });

    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    return sendSuccess(res, 200, 'Post details fetched successfully', {
      post: formatPost(post, req.user ? req.user.userId : '')
    });
  } catch (error) {
    next(error);
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { content, tags } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.author.toString() !== userId) {
      return sendError(res, 403, 'Forbidden: You can only edit your own posts');
    }

    if (post.isFrozen) {
      return sendError(res, 400, 'This post is frozen and cannot be updated.');
    }

    post.content = content !== undefined ? content : post.content;
    if (content !== undefined || tags !== undefined) {
      post.tags = getPostHashtags(post.content, tags !== undefined ? tags : post.tags);
    }

    await post.save();
    await post.populate('author', 'name email avatar bio');

    return sendSuccess(res, 200, 'Post updated successfully', { post });
  } catch (error) {
    next(error);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.author.toString() !== userId) {
      return sendError(res, 403, 'Forbidden: You can only delete your own posts');
    }

    await Post.findOneAndDelete({ _id: id });

    return sendSuccess(res, 200, 'Post and associated comments deleted successfully');
  } catch (error) {
    next(error);
  }
};

export const toggleFreezePost = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.author.toString() !== userId) {
      return sendError(res, 403, 'Forbidden: Only the post author can freeze or unfreeze this post');
    }

    post.isFrozen = !post.isFrozen;
    await post.save();
    await post.populate('author', 'name email avatar bio');

    const statusMessage = post.isFrozen ? 'Post frozen successfully' : 'Post unfrozen successfully';
    return sendSuccess(res, 200, statusMessage, { post });
  } catch (error) {
    next(error);
  }
};

export const toggleLikePost = async (req, res, next) => {
  return togglePostReaction({ ...req, body: {} }, res, next);
};

export const togglePostReaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const post = await Post.findById(id);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.isFrozen) {
      return sendError(res, 400, 'This post is frozen and interactions are disabled.');
    }

    if (!post.reactions) post.reactions = [];
    const existingReactionIndex = post.reactions.findIndex(
      (reaction) => reaction.user.toString() === userId
    );
    const previousReaction = existingReactionIndex >= 0
      ? post.reactions[existingReactionIndex].type
      : post.likes.some((like) => like.toString() === userId) ? 'like' : null;
    const hasExplicitReaction = Object.prototype.hasOwnProperty.call(req.body, 'reaction');
    const requestedReaction = hasExplicitReaction
      ? req.body.reaction
      : previousReaction === 'like' ? null : 'like';

    if (requestedReaction !== null && !reactionTypes.includes(requestedReaction)) {
      return sendError(res, 400, 'Invalid post reaction.');
    }

    if (existingReactionIndex >= 0) {
      post.reactions.splice(existingReactionIndex, 1);
    }
    if (requestedReaction) {
      post.reactions.push({ user: userId, type: requestedReaction });
    }

    const likeIndex = post.likes.findIndex((like) => like.toString() === userId);
    if (requestedReaction === 'like' && likeIndex < 0) post.likes.push(userId);
    if (requestedReaction !== 'like' && likeIndex >= 0) post.likes.splice(likeIndex, 1);
    post.likeCount = post.likes.length;
    await post.save();
    if (requestedReaction && requestedReaction !== previousReaction) {
      await createNotification({
        recipient: post.author,
        actor: userId,
        type: 'like',
        message: `reacted ${requestedReaction} to your post`,
        post: post._id,
        dedupe: true
      });
    }
    await post.populate('author', 'name email avatar bio');

    const reactionState = getPostReactionState(post, userId);
    return sendSuccess(res, 200, 'Post reaction updated', {
      postId: post._id,
      likeCount: post.likeCount,
      likes: post.likes,
      isLiked: reactionState.myReaction === 'like',
      ...reactionState
    });
  } catch (error) {
    next(error);
  }
};
