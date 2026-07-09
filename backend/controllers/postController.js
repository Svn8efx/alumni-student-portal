const asyncHandler = require('express-async-handler');
const Post = require('../models/Post');
const notify = require('../utils/notify');

// @desc    Create a knowledge-feed post
// @route   POST /api/posts
// @access  Private
const createPost = asyncHandler(async (req, res) => {
  const { content, type, tags } = req.body;
  const post = await Post.create({ author: req.user._id, content, type, tags });
  const populated = await post.populate('author', 'name role avatarUrl company');
  res.status(201).json({ success: true, data: populated });
});

// @desc    Get paginated feed (newest first)
// @route   GET /api/posts?page=1&limit=10&type=advice
// @access  Private
const getFeed = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, type } = req.query;
  const query = {};
  if (type) query.type = type;

  const skip = (Number(page) - 1) * Number(limit);
  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', 'name role avatarUrl company graduationYear')
      .populate('comments.author', 'name role avatarUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Post.countDocuments(query),
  ]);

  res.json({ success: true, data: posts, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Toggle like on a post
// @route   PATCH /api/posts/:id/like
// @access  Private
const toggleLike = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  const alreadyLiked = post.likes.some((id) => id.toString() === req.user._id.toString());
  if (alreadyLiked) {
    post.likes = post.likes.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    post.likes.push(req.user._id);
    if (post.author.toString() !== req.user._id.toString()) {
      await notify(req, {
        recipient: post.author,
        type: 'post_like',
        message: `${req.user.name} liked your post`,
        link: '/feed',
        relatedId: post._id,
      });
    }
  }
  await post.save();
  res.json({ success: true, data: { likesCount: post.likes.length, liked: !alreadyLiked } });
});

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }

  post.comments.push({ author: req.user._id, content });
  await post.save();

  if (post.author.toString() !== req.user._id.toString()) {
    await notify(req, {
      recipient: post.author,
      type: 'post_comment',
      message: `${req.user.name} commented on your post`,
      link: '/feed',
      relatedId: post._id,
    });
  }

  const populated = await post.populate('comments.author', 'name role avatarUrl');
  res.status(201).json({ success: true, data: populated.comments });
});

// @desc    Delete own post (or admin can delete any)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    res.status(404);
    throw new Error('Post not found');
  }
  if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this post');
  }
  await post.deleteOne();
  res.json({ success: true, message: 'Post deleted' });
});

module.exports = { createPost, getFeed, toggleLike, addComment, deletePost };
