const mongoose = require('mongoose');

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
  },
  { timestamps: true }
);

// Discussion forum thread - separate from the knowledge feed to keep Q&A style
// discussions (placements, courses, career doubts) organized by category.
const forumThreadSchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 200 },
    body: { type: String, required: true, maxlength: 5000 },
    category: {
      type: String,
      enum: ['placements', 'academics', 'career-advice', 'projects', 'general'],
      default: 'general',
    },
    replies: [replySchema],
    isPinned: { type: Boolean, default: false },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('ForumThread', forumThreadSchema);
