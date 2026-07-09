const asyncHandler = require('express-async-handler');
const Connection = require('../models/Connection');
const notify = require('../utils/notify');

// @desc    Send a connection/mentorship request
// @route   POST /api/connections
// @access  Private
const sendConnectionRequest = asyncHandler(async (req, res) => {
  const { receiverId, message } = req.body;

  if (receiverId === req.user._id.toString()) {
    res.status(400);
    throw new Error('You cannot connect with yourself');
  }

  const existing = await Connection.findOne({
    $or: [
      { requester: req.user._id, receiver: receiverId },
      { requester: receiverId, receiver: req.user._id },
    ],
  });
  if (existing) {
    res.status(400);
    throw new Error(`A connection request already exists with status: ${existing.status}`);
  }

  const connection = await Connection.create({
    requester: req.user._id,
    receiver: receiverId,
    message,
  });

  await notify(req, {
    recipient: receiverId,
    type: 'connection_request',
    message: `${req.user.name} sent you a connection request`,
    link: '/connections',
    relatedId: connection._id,
  });

  res.status(201).json({ success: true, data: connection });
});

// @desc    Respond to a connection request (accept/reject)
// @route   PATCH /api/connections/:id
// @access  Private
const respondToConnectionRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'accepted' | 'rejected'
  if (!['accepted', 'rejected'].includes(status)) {
    res.status(400);
    throw new Error("Status must be 'accepted' or 'rejected'");
  }

  const connection = await Connection.findById(req.params.id);
  if (!connection) {
    res.status(404);
    throw new Error('Connection request not found');
  }
  if (connection.receiver.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the receiver can respond to this request');
  }

  connection.status = status;
  await connection.save();

  if (status === 'accepted') {
    await notify(req, {
      recipient: connection.requester,
      type: 'connection_accepted',
      message: `${req.user.name} accepted your connection request`,
      link: '/connections',
      relatedId: connection._id,
    });
  }

  res.json({ success: true, data: connection });
});

// @desc    List my connections (sent + received), optionally filtered by status
// @route   GET /api/connections?status=accepted
// @access  Private
const getMyConnections = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const query = {
    $or: [{ requester: req.user._id }, { receiver: req.user._id }],
  };
  if (status) query.status = status;

  const connections = await Connection.find(query)
    .populate('requester', 'name role avatarUrl company graduationYear')
    .populate('receiver', 'name role avatarUrl company graduationYear')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: connections });
});

module.exports = { sendConnectionRequest, respondToConnectionRequest, getMyConnections };
