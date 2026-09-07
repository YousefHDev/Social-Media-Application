import User from '../models/User.js';
import Post from '../models/Post.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { name, bio } = req.body;

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;

    const updatedUser = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Profile updated successfully', { user: updatedUser.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return sendError(res, 400, 'Please select an image file to upload.');
    }

    const userId = req.user.userId;
    // Construct avatar URL path
    const avatarUrl = `/uploads/${req.file.filename}`;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarUrl },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return sendError(res, 404, 'User not found');
    }

    return sendSuccess(res, 200, 'Avatar uploaded successfully', { user: updatedUser.toJSON() });
  } catch (error) {
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    const postsCount = await Post.countDocuments({ author: id });

    return sendSuccess(res, 200, 'User profile fetched successfully', {
      user: user.toJSON(),
      stats: {
        postsCount
      },
      shareLink: `${req.protocol}://${req.get('host')}/#profile/${user._id}`
    });
  } catch (error) {
    next(error);
  }
};
