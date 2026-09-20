import Post from '../models/Post.js';
import { formatPost } from './postController.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

const normalizeTag = (value) => value.trim().replace(/^#/, '').toLowerCase();

export const getHashtagPosts = async (req, res, next) => {
  try {
    const tag = normalizeTag(req.params.tag);
    if (!/^[a-z0-9_]{1,50}$/.test(tag)) return sendError(res, 400, 'Invalid hashtag.');
    const page = Math.min(Math.max(parseInt(req.query.page, 10) || 1, 1), 100);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 20);
    const sort = req.query.sort === 'popular'
      ? { likeCount: -1, commentCount: -1, createdAt: -1 }
      : { createdAt: -1 };
    const query = { tags: tag };
    const [total, posts] = await Promise.all([
      Post.countDocuments(query),
      Post.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('author', 'name avatar bio')
    ]);

    return sendSuccess(res, 200, 'Hashtag posts fetched successfully', {
      hashtag: tag,
      total,
      posts: posts.map((post) => formatPost(post, req.user ? req.user.userId : '')),
      pagination: { page, limit, totalPages: Math.ceil(total / limit) || 1, hasMore: page * limit < total }
    });
  } catch (error) {
    next(error);
  }
};

export const getTrendingHashtags = async (req, res, next) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
    const trending = await Post.aggregate([
      { $match: { createdAt: { $gte: since }, tags: { $type: 'array', $ne: [] } } },
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          postCount: { $sum: 1 },
          reactions: { $sum: { $add: ['$likeCount', '$commentCount', { $size: { $ifNull: ['$reactions', []] } }] } }
        }
      },
      { $addFields: { score: { $add: ['$postCount', '$reactions'] } } },
      { $sort: { score: -1, postCount: -1, _id: 1 } },
      { $limit: limit }
    ]);

    return sendSuccess(res, 200, 'Trending hashtags fetched successfully', {
      hashtags: trending.map((item) => ({
        name: item._id,
        postCount: item.postCount,
        score: item.score
      })),
      window: '7d'
    });
  } catch (error) {
    next(error);
  }
};
