import Comment from '../models/Comment.js';
import Post from '../models/Post.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { createNotification } from '../utils/notificationService.js';

export const createComment = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = req.user.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    if (post.isFrozen) {
      return sendError(res, 400, 'This post is frozen. New comments are disabled.');
    }

    let parentComment = null;
    if (parentCommentId) {
      parentComment = await Comment.findById(parentCommentId);
      if (!parentComment) {
        return sendError(res, 404, 'Parent comment not found');
      }
      if (parentComment.post.toString() !== postId) {
        return sendError(res, 400, 'Parent comment does not belong to this post');
      }
    }

    const comment = new Comment({
      post: postId,
      author: userId,
      parentComment: parentComment ? parentComment._id : null,
      content
    });

    await comment.save();
    await createNotification({
      recipient: parentComment ? parentComment.author : post.author,
      actor: userId,
      type: parentComment ? 'reply' : 'comment',
      message: parentComment ? 'replied to your comment' : 'commented on your post',
      post: post._id,
      comment: comment._id
    });
    await comment.populate('author', 'name email avatar bio');

    // Fetch updated comment count from parent post
    const updatedPost = await Post.findById(postId).select('commentCount');

    const commentObj = comment.toJSON();
    commentObj.isLiked = false;
    commentObj.replyCount = 0;

    return sendSuccess(res, 201, 'Comment added successfully', {
      comment: commentObj,
      commentCount: updatedPost ? updatedPost.commentCount : 0
    });
  } catch (error) {
    next(error);
  }
};

export const getPostComments = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;
    const currentUserId = req.user ? req.user.userId : null;

    const post = await Post.findById(postId);
    if (!post) {
      return sendError(res, 404, 'Post not found');
    }

    // Query top-level comments only for pagination
    const totalComments = await Comment.countDocuments({ post: postId, parentComment: null });
    const comments = await Comment.find({ post: postId, parentComment: null })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('author', 'name email avatar bio');

    // Attach replyCount and isLiked status to each comment
    const formattedComments = await Promise.all(
      comments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({ parentComment: comment._id });
        const commentObj = comment.toJSON();
        commentObj.replyCount = replyCount;
        commentObj.isLiked = currentUserId
          ? comment.likes.some((id) => id.toString() === currentUserId)
          : false;
        return commentObj;
      })
    );

    const totalPages = Math.ceil(totalComments / limit);
    const hasMore = page < totalPages;

    return sendSuccess(res, 200, 'Comments fetched successfully', {
      comments: formattedComments,
      pagination: {
        totalComments,
        page,
        totalPages,
        hasMore,
        limit
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getCommentReplies = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const currentUserId = req.user ? req.user.userId : null;

    const parentComment = await Comment.findById(commentId);
    if (!parentComment) {
      return sendError(res, 404, 'Parent comment not found');
    }

    const replies = await Comment.find({ parentComment: commentId })
      .sort({ createdAt: 1 })
      .populate('author', 'name email avatar bio');

    const formattedReplies = replies.map((reply) => {
      const replyObj = reply.toJSON();
      replyObj.isLiked = currentUserId
        ? reply.likes.some((id) => id.toString() === currentUserId)
        : false;
      return replyObj;
    });

    return sendSuccess(res, 200, 'Replies fetched successfully', {
      replies: formattedReplies
    });
  } catch (error) {
    next(error);
  }
};

export const updateComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    if (comment.author.toString() !== userId) {
      return sendError(res, 403, 'Forbidden: You can only edit your own comment');
    }

    comment.content = content;
    comment.isEdited = true;
    comment.editedAt = new Date();

    await comment.save();
    await comment.populate('author', 'name email avatar bio');

    const commentObj = comment.toJSON();
    commentObj.isLiked = comment.likes.some((id) => id.toString() === userId);

    return sendSuccess(res, 200, 'Comment updated successfully', {
      comment: commentObj
    });
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

export const toggleLikeComment = async (req, res, next) => {
  try {
    const { commentId } = req.params;
    const userId = req.user.userId;

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return sendError(res, 404, 'Comment not found');
    }

    const likeIndex = comment.likes.findIndex((id) => id.toString() === userId);
    let isLiked = false;

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
      comment.likeCount = Math.max(0, comment.likeCount - 1);
      isLiked = false;
    } else {
      comment.likes.push(userId);
      comment.likeCount += 1;
      isLiked = true;
    }

    await comment.save();
    if (isLiked) {
      await comment.populate('author', '_id');
      await createNotification({
        recipient: comment.author._id || comment.author,
        actor: userId,
        type: 'like',
        message: 'liked your comment',
        post: comment.post,
        comment: comment._id
      });
    }

    return sendSuccess(res, 200, isLiked ? 'Comment liked' : 'Comment unliked', {
      isLiked,
      likeCount: comment.likeCount
    });
  } catch (error) {
    next(error);
  }
};
