const mongoose = require('mongoose');

// Direct message between two connected users. A `conversationId` (sorted pair
// of user ids joined by '_') lets us fetch a whole thread with one query.
const messageSchema = new mongoose.Schema(
  {
    conversationId: { type: String, required: true, index: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, maxlength: 2000 },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

messageSchema.statics.buildConversationId = (userA, userB) =>
  [userA.toString(), userB.toString()].sort().join('_');

module.exports = mongoose.model('Message', messageSchema);
