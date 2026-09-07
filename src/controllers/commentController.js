import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.isFrozen) {
      return sendError(res, 400, 'This post is frozen. New comments are disabled.');
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      content
    });

    await comment.save();
    await comment.populate('author', 'name email avatar bio');

    // Fetch updated comment count from parent post
    const updatedPost = await Post.findById(postId).select('commentCount');

    return sendSuccess(res, 201, 'Comment added successfully', {
      comment,
      commentCount: updatedPost ? updatedPost.commentCount : 0
    });
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('author', 'name email avatar bio');

    return sendSuccess(res, 200, 'Comments fetched successfully', { comments });
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId).populate('post', 'author');
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    const isCommentAuthor = comment.author.toString() === userId;
    const isPostAuthor = comment.post && comment.post.author.toString() === userId;

    if (!isCommentAuthor && !isPostAuthor) {
      return sendError(res, 403, 'Forbidden: You can only delete your own comments or comments on your post');
    }

    const postId = comment.post ? comment.post._id : comment.post;

    await Comment.findOneAndDelete({ _id: commentId });

    const updatedPost = await Post.findById(postId).select('commentCount');

    return sendSuccess(res, 200, 'Comment deleted successfully', {
      commentCount: updatedPost ? updatedPost.commentCount : 0
    });
  } catch (error) {
    next(error);
  }
};
