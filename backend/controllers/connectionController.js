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

  if (existing && existing.status !== 'rejected') {
    res.status(400);
    throw new Error(`A connection request already exists with status: ${existing.status}`);
  }

  let connection;
  if (existing) {
    // A previously rejected request can be re-sent. Reuse the same document
    // (a unique index on requester+receiver prevents creating a second one)
    // and point it in the current direction, in case the original receiver
    // is the one re-initiating this time.
    existing.requester = req.user._id;
    existing.receiver = receiverId;
    existing.status = 'pending';
    existing.message = message;
    connection = await existing.save();
  } else {
    connection = await Connection.create({
      requester: req.user._id,
      receiver: receiverId,
      message,
    });
  }

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

// @desc    Cancel a pending request you sent (deletes it)
// @route   DELETE /api/connections/:id
// @access  Private
const cancelConnectionRequest = asyncHandler(async (req, res) => {
  const connection = await Connection.findById(req.params.id);
  if (!connection) {
    res.status(404);
    throw new Error('Connection request not found');
  }
  if (connection.requester.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Only the requester can cancel this request');
  }
  if (connection.status !== 'pending') {
    res.status(400);
    throw new Error('Only pending requests can be cancelled');
  }

  await connection.deleteOne();
  res.json({ success: true, data: { id: req.params.id } });
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

module.exports = {
  sendConnectionRequest,
  respondToConnectionRequest,
  cancelConnectionRequest,
  getMyConnections,
};