const Notification = require('../models/Notification');

/**
 * Creates a notification document and (if socket.io is initialized)
 * pushes it in real time to the recipient's room.
 * @param {import('express').Request} req - used to access req.io set in server.js
 */
const notify = async (req, { recipient, type, message, link = '', relatedId = null }) => {
  const notification = await Notification.create({ recipient, type, message, link, relatedId });

  if (req && req.io) {
    req.io.to(recipient.toString()).emit('notification', notification);
  }
  return notification;
};

module.exports = notify;
