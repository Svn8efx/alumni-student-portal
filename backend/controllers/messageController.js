const asyncHandler = require('express-async-handler');
const Message = require('../models/Message');
const Connection = require('../models/Connection');
const notify = require('../utils/notify');

// @desc    Send a direct message (only allowed between accepted connections)
// @route   POST /api/messages
// @access  Private
const sendMessage = asyncHandler(async (req, res) => {
  const { receiverId, content } = req.body;

  const connection = await Connection.findOne({
    status: 'accepted',
    $or: [
      { requester: req.user._id, receiver: receiverId },
      { requester: receiverId, receiver: req.user._id },
    ],
  });

  if (!connection) {
    res.status(403);
    throw new Error('You can only message users you are connected with');
  }

  const conversationId = Message.buildConversationId(req.user._id, receiverId);
  const message = await Message.create({
    conversationId,
    sender: req.user._id,
    receiver: receiverId,
    content,
  });

  await notify(req, {
    recipient: receiverId,
    type: 'new_message',
    message: `New message from ${req.user.name}`,
    link: `/messages/${req.user._id}`,
    relatedId: message._id,
  });

  if (req.io) {
    req.io.to(receiverId.toString()).emit('new_message', message);
  }

  res.status(201).json({ success: true, data: message });
});

// @desc    Get full conversation with a specific user
// @route   GET /api/messages/:userId
// @access  Private
const getConversation = asyncHandler(async (req, res) => {
  const conversationId = Message.buildConversationId(req.user._id, req.params.userId);
  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });

  // Mark incoming messages as read
  await Message.updateMany(
    { conversationId, receiver: req.user._id, isRead: false },
    { $set: { isRead: true } }
  );

  res.json({ success: true, data: messages });
});

// @desc    List all conversations for the logged-in user (inbox preview)
// @route   GET /api/messages
// @access  Private
const getInbox = asyncHandler(async (req, res) => {
  const messages = await Message.aggregate([
    { $match: { $or: [{ sender: req.user._id }, { receiver: req.user._id }] } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$conversationId',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [{ $and: [{ $eq: ['$receiver', req.user._id] }, { $eq: ['$isRead', false] }] }, 1, 0],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
  ]);

  res.json({ success: true, data: messages });
});

module.exports = { sendMessage, getConversation, getInbox };
