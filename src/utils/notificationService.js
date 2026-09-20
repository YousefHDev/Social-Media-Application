import Notification from '../models/Notification.js';

export const createNotification = async ({
  recipient,
  actor,
  type,
  message,
  post,
  comment,
  conversation,
  dedupe = false
}) => {
  if (!recipient || !actor || recipient.toString() === actor.toString()) return null;

  const notificationData = {
    recipient,
    actor,
    type,
    message,
    ...(post ? { post } : {}),
    ...(comment ? { comment } : {}),
    ...(conversation ? { conversation } : {})
  };

  if (dedupe) {
    return Notification.findOneAndUpdate(
      { recipient, actor, type, ...(post ? { post } : {}) },
      { $set: notificationData, read: false },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
  }

  return Notification.create(notificationData);
};
