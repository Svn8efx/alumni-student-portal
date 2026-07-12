const asyncHandler = require('express-async-handler');
const ForumThread = require('../models/ForumThread');
const notify = require('../utils/notify');

// @desc    Create a new discussion thread
// @route   POST /api/forum
// @access  Private
const createThread = asyncHandler(async (req, res) => {
  const { title, body, category } = req.body;
  const thread = await ForumThread.create({ author: req.user._id, title, body, category });
  const populated = await thread.populate('author', 'name role avatarUrl');
  res.status(201).json({ success: true, data: populated });
});

// @desc    List threads with optional category filter
// @route   GET /api/forum?category=placements&page=1&limit=10
// @access  Private
const getThreads = asyncHandler(async (req, res) => {
  const { category, page = 1, limit = 10 } = req.query;
  const match = {};
  if (category) match.category = category;

  const skip = (Number(page) - 1) * Number(limit);

  const [threads, total] = await Promise.all([
    ForumThread.aggregate([
      { $match: match },
      { $sort: { isPinned: -1, createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      { $addFields: { repliesCount: { $size: { $ifNull: ['$replies', []] } } } },
      { $project: { replies: 0 } },
      { $lookup: { from: 'users', localField: 'author', foreignField: '_id', as: 'author' } },
      { $unwind: '$author' },
      {
        $project: {
          title: 1, body: 1, category: 1, isPinned: 1, views: 1, repliesCount: 1,
          createdAt: 1, updatedAt: 1,
          'author._id': 1, 'author.name': 1, 'author.role': 1, 'author.avatarUrl': 1,
        },
      },
    ]),
    ForumThread.countDocuments(match),
  ]);

  res.json({ success: true, data: threads, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Get single thread with all replies, increments view count
// @route   GET /api/forum/:id
// @access  Private
const getThreadById = asyncHandler(async (req, res) => {
  const thread = await ForumThread.findByIdAndUpdate(
    req.params.id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('author', 'name role avatarUrl company')
    .populate('replies.author', 'name role avatarUrl');

  if (!thread) {
    res.status(404);
    throw new Error('Thread not found');
  }
  res.json({ success: true, data: thread });
});

// @desc    Reply to a thread
// @route   POST /api/forum/:id/replies
// @access  Private
const addReply = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const thread = await ForumThread.findById(req.params.id);
  if (!thread) {
    res.status(404);
    throw new Error('Thread not found');
  }

  thread.replies.push({ author: req.user._id, content });
  await thread.save();

  if (thread.author.toString() !== req.user._id.toString()) {
    await notify(req, {
      recipient: thread.author,
      type: 'forum_reply',
      message: `${req.user.name} replied to your thread "${thread.title}"`,
      link: `/forum/${thread._id}`,
      relatedId: thread._id,
    });
  }

  const populated = await thread.populate('replies.author', 'name role avatarUrl');
  res.status(201).json({ success: true, data: populated.replies });
});

// @desc    Delete own thread (or admin can delete any)
// @route   DELETE /api/forum/:id
// @access  Private
const deleteThread = asyncHandler(async (req, res) => {
  const thread = await ForumThread.findById(req.params.id);
  if (!thread) {
    res.status(404);
    throw new Error('Thread not found');
  }
  if (thread.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this thread');
  }
  await thread.deleteOne();
  res.json({ success: true, message: 'Thread deleted' });
});

// @desc    Delete own reply (or admin can delete any)
// @route   DELETE /api/forum/:id/replies/:replyId
// @access  Private
const deleteReply = asyncHandler(async (req, res) => {
  const thread = await ForumThread.findById(req.params.id);
  if (!thread) {
    res.status(404);
    throw new Error('Thread not found');
  }
  const reply = thread.replies.id(req.params.replyId);
  if (!reply) {
    res.status(404);
    throw new Error('Reply not found');
  }
  if (reply.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this reply');
  }
  reply.deleteOne();
  await thread.save();
  res.json({ success: true, message: 'Reply deleted' });
});

module.exports = { createThread, getThreads, getThreadById, addReply, deleteThread, deleteReply };