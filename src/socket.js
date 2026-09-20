import { Server } from 'socket.io';
import { verifyAccessToken } from './utils/jwt.js';
import Conversation from './models/Conversation.js';
import Message from './models/Message.js';
import { config } from './config/env.js';
import { createNotification } from './utils/notificationService.js';

const onlineUsers = new Map(); // userId -> socketId

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.corsOrigin === '*' ? true : config.corsOrigin.split(',').map(o => o.trim()),
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // JWT Socket Authorization Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.startsWith('Bearer ') &&
          socket.handshake.headers.authorization.split(' ')[1]);

      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }

      const decoded = verifyAccessToken(token);
      socket.userId = decoded.userId;
      socket.userEmail = decoded.email;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid or expired token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);

    // Join user's personal notification room
    socket.join(`user_${userId}`);

    // Broadcast updated online users list
    io.emit('online_users', Array.from(onlineUsers.keys()));

    // Join conversation room
    socket.on('join_conversation', async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (conversation && conversation.participants.some(p => p.toString() === userId)) {
          socket.join(`conversation_${conversationId}`);
        }
      } catch (e) {
        console.error('Socket join_conversation error:', e.message);
      }
    });

    // Leave conversation room
    socket.on('leave_conversation', (conversationId) => {
      socket.leave(`conversation_${conversationId}`);
    });

    // Handle real-time messaging
    socket.on('send_message', async ({ conversationId, recipientId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation || !conversation.participants.some(p => p.toString() === userId)) {
          return;
        }

        const message = new Message({
          conversation: conversationId,
          sender: userId,
          recipient: recipientId,
          content: content.trim()
        });

        await message.save();
        await message.populate('sender', 'name avatar');

        conversation.lastMessage = message._id;
        await conversation.save();
        const notification = await createNotification({
          recipient: recipientId,
          actor: userId,
          type: 'message',
          message: 'sent you a message',
          conversation: conversationId
        });

        const messagePayload = message.toJSON();

        // Emit message to conversation room and directly to recipient room
        io.to(`conversation_${conversationId}`).emit('new_message', messagePayload);
        io.to(`user_${recipientId}`).emit('new_message_notification', messagePayload);
        if (notification) {
          io.to(`user_${recipientId}`).emit('new_notification', notification);
        }
      } catch (err) {
        socket.emit('error_message', { message: 'Failed to deliver message' });
      }
    });

    // Typing indicators
    socket.on('typing', ({ conversationId, recipientId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_typing', {
        userId,
        conversationId
      });
    });

    socket.on('stop_typing', ({ conversationId, recipientId }) => {
      socket.to(`conversation_${conversationId}`).emit('user_stop_typing', {
        userId,
        conversationId
      });
    });

    socket.on('disconnect', () => {
      onlineUsers.delete(userId);
      io.emit('online_users', Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

export const getOnlineUsers = () => Array.from(onlineUsers.keys());
