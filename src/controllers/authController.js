import User from '../models/User.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return sendError(res, 400, 'An account with this email already exists.');
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password
    });

    const accessToken = generateAccessToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id, email: user.email });

    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(res, 201, 'Account created successfully', {
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password +refreshToken');
    if (!user) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return sendError(res, 401, 'Invalid email or password.');
    }

    const accessToken = generateAccessToken({ userId: user._id, email: user.email });
    const refreshToken = generateRefreshToken({ userId: user._id, email: user.email });

    user.refreshToken = refreshToken;
    await user.save();

    return sendSuccess(res, 200, 'Logged in successfully', {
      user: user.toJSON(),
      accessToken,
      refreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return sendError(res, 400, 'Refresh token is required.');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(token);
    } catch (err) {
      return sendError(res, 401, 'Invalid or expired refresh token. Please login again.');
    }

    const user = await User.findById(decoded.userId).select('+refreshToken');
    if (!user || user.refreshToken !== token) {
      return sendError(res, 401, 'Refresh token is invalid or revoked.');
    }

    const newAccessToken = generateAccessToken({ userId: user._id, email: user.email });
    const newRefreshToken = generateRefreshToken({ userId: user._id, email: user.email });

    user.refreshToken = newRefreshToken;
    await user.save();

    return sendSuccess(res, 200, 'Token refreshed successfully', {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    await User.findByIdAndUpdate(userId, { refreshToken: '' });
    return sendSuccess(res, 200, 'Logged out successfully');
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return sendError(res, 404, 'User not found.');
    }
    return sendSuccess(res, 200, 'Current user profile fetched successfully', { user: user.toJSON() });
  } catch (error) {
    next(error);
  }
};
