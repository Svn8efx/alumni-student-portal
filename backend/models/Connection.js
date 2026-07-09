const mongoose = require('mongoose');

// Represents a mentorship / networking connection request between two users
// (typically student -> alumni, but kept generic for peer networking too).
const connectionSchema = new mongoose.Schema(
  {
    requester: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    message: { type: String, maxlength: 500 }, // optional note sent with the request
  },
  { timestamps: true }
);

// Prevent duplicate pending requests between the same pair of users
connectionSchema.index({ requester: 1, receiver: 1 }, { unique: true });

module.exports = mongoose.model('Connection', connectionSchema);
