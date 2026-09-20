import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';

export const getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const limit = Math.min(parseInt(req.query.limit, 10) || 30, 50);
    const notifications = await Notification.find({ recipient: userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('actor', 'name avatar')
      .lean();
    const unreadCount = await Notification.countDocuments({ recipient: userId, read: false });

    return sendSuccess(res, 200, 'Notifications fetched successfully', {
      notifications,
      unreadCount
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notification) return sendError(res, 404, 'Notification not found');
    return sendSuccess(res, 200, 'Notification marked as read', { notification });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user.userId, read: false },
      { read: true }
    );
    return sendSuccess(res, 200, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};
