import Conversation from '../models/Conversation.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import { sendSuccess, sendError } from '../utils/responseHandler.js';
import { createNotification } from '../utils/notificationService.js';

export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const conversations = await Conversation.find({ participants: userId })
      .sort({ updatedAt: -1 })
      .populate('participants', 'name email avatar bio')
      .populate('lastMessage');

    // Calculate unread count for each conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (conv) => {
        const convObj = conv.toJSON();
        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          recipient: userId,
          read: false
        });
        return {
          ...convObj,
          unreadCount
        };
      })
    );

    return sendSuccess(res, 200, 'Conversations fetched successfully', {
      conversations: conversationsWithUnread
    });
  } catch (error) {
    next(error);
  }
};

export const createOrGetConversation = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { recipientId } = req.body;

    if (!recipientId) {
      return sendError(res, 400, 'Recipient user ID is required.');
    }

    if (userId === recipientId) {
      return sendError(res, 400, 'You cannot start a conversation with yourself.');
    }

    const recipientUser = await User.findById(recipientId);
    if (!recipientUser) {
      return sendError(res, 404, 'Recipient user not found.');
    }

    let conversation = await Conversation.findOne({
      participants: { $all: [userId, recipientId], $size: 2 }
    })
      .populate('participants', 'name email avatar bio')
      .populate('lastMessage');

    if (!conversation) {
      conversation = new Conversation({
        participants: [userId, recipientId]
      });
      await conversation.save();
      await conversation.populate('participants', 'name email avatar bio');
    }

    return sendSuccess(res, 200, 'Conversation retrieved successfully', {
      conversation
    });
  } catch (error) {
    next(error);
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendError(res, 404, 'Conversation not found.');
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return sendError(res, 403, 'Forbidden: You are not a participant in this conversation.');
    }

    // Mark unread messages sent to this user as read
    await Message.updateMany(
      { conversation: conversationId, recipient: userId, read: false },
      { read: true }
    );

    const messages = await Message.find({ conversation: conversationId })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar');

    return sendSuccess(res, 200, 'Messages fetched successfully', {
      messages
    });
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { conversationId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return sendError(res, 400, 'Message content cannot be empty.');
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return sendError(res, 404, 'Conversation not found.');
    }

    const isParticipant = conversation.participants.some(p => p.toString() === userId);
    if (!isParticipant) {
      return sendError(res, 403, 'Forbidden: You are not a participant in this conversation.');
    }

    const recipientId = conversation.participants.find(p => p.toString() !== userId);

    const message = new Message({
      conversation: conversationId,
      sender: userId,
      recipient: recipientId,
      content: content.trim()
    });

    await message.save();
    await createNotification({
      recipient: recipientId,
      actor: userId,
      type: 'message',
      message: 'sent you a message',
      conversation: conversation._id
    });
    await message.populate('sender', 'name avatar');

    conversation.lastMessage = message._id;
    await conversation.save();

    return sendSuccess(res, 201, 'Message sent successfully', {
      message
    });
  } catch (error) {
    next(error);
  }
};
