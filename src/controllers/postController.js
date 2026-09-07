import Post from '../models/Post.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const createPost = async (req, res, next) => {
  try {
    const { content, tags } = req.body;
    const authorId = req.user.userId;

    const post = new Post({
      author: authorId,
      content,
      tags: tags || []
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

    const { search, tag, author, isFrozen, sortBy } = req.query;

    // Build query filters
    const query = {};

    if (search) {
      query.content = { $regex: search, $options: 'i' };
    }

    if (tag) {
      query.tags = tag.toLowerCase();
    }

    if (author) {
      query.author = author;
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

    const totalPages = Math.ceil(total / limit) || 1;

    return sendSuccess(res, 200, 'Posts fetched successfully', {
      posts,
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

    return sendSuccess(res, 200, 'Post details fetched successfully', { post });
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
    if (tags !== undefined) post.tags = tags;

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

    // Trigger Mongoose findOneAndDelete hook to clean up comments
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

    const likeIndex = post.likes.indexOf(userId);
    let message;

    if (likeIndex > -1) {
      // Unlike
      post.likes.splice(likeIndex, 1);
      message = 'Post unliked successfully';
    } else {
      // Like
      post.likes.push(userId);
      message = 'Post liked successfully';
    }

    post.likeCount = post.likes.length;
    await post.save();
    await post.populate('author', 'name email avatar bio');

    return sendSuccess(res, 200, message, {
      postId: post._id,
      likeCount: post.likeCount,
      likes: post.likes,
      isLiked: post.likes.includes(userId)
    });
  } catch (error) {
    next(error);
  }
};
