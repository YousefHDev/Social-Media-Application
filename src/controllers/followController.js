import Follow from '../models/Follow.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { createNotification } from '../utils/notificationService.js';

export const followUser = async (req, res, next) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.id;

    if (followerId === followingId) {
      return sendError(res, 400, 'You cannot follow yourself.');
    }

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return sendError(res, 404, 'User to follow not found.');
    }

    // Check if relationship already exists
    const existingFollow = await Follow.findOne({ follower: followerId, following: followingId });
    if (!existingFollow) {
      await Follow.create({ follower: followerId, following: followingId });
      await createNotification({
        recipient: followingId,
        actor: followerId,
        type: 'follow',
        message: 'started following you'
      });
    }

    const followersCount = await Follow.countDocuments({ following: followingId });
    const followingCount = await Follow.countDocuments({ follower: followingId });

    return sendSuccess(res, 200, `You are now following ${targetUser.name}`, {
      isFollowing: true,
      followersCount,
      followingCount,
      targetUserId: followingId
    });
  } catch (error) {
    next(error);
  }
};

export const unfollowUser = async (req, res, next) => {
  try {
    const followerId = req.user.userId;
    const followingId = req.params.id;

    const targetUser = await User.findById(followingId);
    if (!targetUser) {
      return sendError(res, 404, 'User not found.');
    }

    await Follow.findOneAndDelete({ follower: followerId, following: followingId });

    const followersCount = await Follow.countDocuments({ following: followingId });
    const followingCount = await Follow.countDocuments({ follower: followingId });

    return sendSuccess(res, 200, `Unfollowed ${targetUser.name}`, {
      isFollowing: false,
      followersCount,
      followingCount,
      targetUserId: followingId
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user ? req.user.userId : null;

    const follows = await Follow.find({ following: targetUserId })
      .populate('follower', 'name email avatar bio')
      .sort({ createdAt: -1 });

    const followerUsers = follows
      .filter(f => f.follower != null)
      .map(f => f.follower);

    // If request has logged-in user, check who current user is following
    let currentUserFollowingIds = [];
    if (currentUserId) {
      currentUserFollowingIds = await Follow.find({ follower: currentUserId }).distinct('following');
      currentUserFollowingIds = currentUserFollowingIds.map(id => id.toString());
    }

    const followersWithStatus = followerUsers.map(u => {
      const uJson = u.toJSON ? u.toJSON() : u;
      return {
        ...uJson,
        isFollowing: currentUserId ? currentUserFollowingIds.includes(uJson._id.toString()) : false,
        isSelf: currentUserId ? currentUserId === uJson._id.toString() : false
      };
    });

    return sendSuccess(res, 200, 'Followers fetched successfully', {
      followers: followersWithStatus,
      total: followersWithStatus.length
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user ? req.user.userId : null;

    const follows = await Follow.find({ follower: targetUserId })
      .populate('following', 'name email avatar bio')
      .sort({ createdAt: -1 });

    const followingUsers = follows
      .filter(f => f.following != null)
      .map(f => f.following);

    let currentUserFollowingIds = [];
    if (currentUserId) {
      currentUserFollowingIds = await Follow.find({ follower: currentUserId }).distinct('following');
      currentUserFollowingIds = currentUserFollowingIds.map(id => id.toString());
    }

    const followingWithStatus = followingUsers.map(u => {
      const uJson = u.toJSON ? u.toJSON() : u;
      return {
        ...uJson,
        isFollowing: currentUserId ? currentUserFollowingIds.includes(uJson._id.toString()) : false,
        isSelf: currentUserId ? currentUserId === uJson._id.toString() : false
      };
    });

    return sendSuccess(res, 200, 'Following list fetched successfully', {
      following: followingWithStatus,
      total: followingWithStatus.length
    });
  } catch (error) {
    next(error);
  }
};

export const getSuggestedUsers = async (req, res, next) => {
  try {
    const currentUserId = req.user ? req.user.userId : null;

    let excludeIds = [];
    if (currentUserId) {
      const currentlyFollowing = await Follow.find({ follower: currentUserId }).distinct('following');
      excludeIds = [...currentlyFollowing.map(id => id.toString()), currentUserId.toString()];
    }

    const suggestedUsers = await User.find({ _id: { $nin: excludeIds } })
      .limit(5)
      .select('name email avatar bio');

    return sendSuccess(res, 200, 'Suggested users fetched successfully', {
      suggestedUsers
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowStatus = async (req, res, next) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.user ? req.user.userId : null;

    const followersCount = await Follow.countDocuments({ following: targetUserId });
    const followingCount = await Follow.countDocuments({ follower: targetUserId });

    let isFollowing = false;
    if (currentUserId) {
      const followDoc = await Follow.findOne({ follower: currentUserId, following: targetUserId });
      isFollowing = !!followDoc;
    }

    return sendSuccess(res, 200, 'Follow status fetched successfully', {
      isFollowing,
      followersCount,
      followingCount
    });
  } catch (error) {
    next(error);
  }
};
