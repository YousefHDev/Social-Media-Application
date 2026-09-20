import User from '../models/User.js';
import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import { formatPost } from './postController.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export const globalSearch = async (req, res, next) => {
  try {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q.trim() : '';
    if (rawQuery.length < 2) return sendError(res, 400, 'Search query must contain at least 2 characters.');

    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 100);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
    const type = ['all', 'users', 'posts', 'hashtags'].includes(req.query.type) ? req.query.type : 'all';
    const query = escapeRegex(rawQuery.replace(/^#/, ''));
    const regex = new RegExp(query, 'i');
    const response = {};
    let followingIds = [];
    if (req.user) {
      followingIds = await Follow.find({ follower: req.user.userId }).distinct('following');
    }

    if (type === 'all' || type === 'users') {
      const userQuery = { name: regex };
      const [users, userTotal] = await Promise.all([
        User.find(userQuery).select('name avatar bio').sort({ name: 1 }).skip((page - 1) * limit).limit(limit).lean(),
        User.countDocuments(userQuery)
      ]);
      response.users = users.map((user) => ({
        ...user,
        isFollowing: followingIds.some((id) => id.toString() === user._id.toString()),
        isSelf: req.user ? user._id.toString() === req.user.userId : false
      }));
      response.usersPagination = { total: userTotal, page, limit, hasMore: page * limit < userTotal };
    }

    if (type === 'all' || type === 'posts') {
      const postQuery = { $or: [{ content: regex }, { tags: regex }] };
      const [posts, postTotal] = await Promise.all([
        Post.find(postQuery).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).populate('author', 'name avatar bio'),
        Post.countDocuments(postQuery)
      ]);
      const followingSet = new Set(followingIds.map((id) => id.toString()));
      response.posts = posts.map((post) => ({
        ...formatPost(post, req.user ? req.user.userId : ''),
        isFollowing: req.user ? followingSet.has(post.author._id.toString()) : false
      }));
      response.postsPagination = { total: postTotal, page, limit, hasMore: page * limit < postTotal };
    }

    if (type === 'all' || type === 'hashtags') {
      const hashtagRows = await Post.aggregate([
        { $match: { tags: { $regex: regex } } },
        { $unwind: '$tags' },
        { $match: { tags: { $regex: regex } } },
        { $group: { _id: '$tags', postCount: { $sum: 1 } } },
        { $sort: { postCount: -1, _id: 1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      ]);
      response.hashtags = hashtagRows.map((row) => ({
        name: row._id,
        postCount: row.postCount
      }));
      response.hashtagsPagination = {
        page,
        limit,
        hasMore: hashtagRows.length === limit
      };
    }

    return sendSuccess(res, 200, 'Search completed successfully', response);
  } catch (error) {
    next(error);
  }
};
