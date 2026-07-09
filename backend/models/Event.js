const mongoose = require('mongoose');

// Alumni-hosted or institution-hosted event / webinar
const eventSchema = new mongoose.Schema(
  {
    hostedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 150 },
    description: { type: String, required: true, maxlength: 3000 },
    date: { type: Date, required: true },
    mode: { type: String, enum: ['online', 'offline', 'hybrid'], default: 'online' },
    location: { type: String, default: '' }, // physical venue or meeting link
    registrations: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    capacity: { type: Number, default: 0 }, // 0 = unlimited
  },
  { timestamps: true }
);

module.exports = mongoose.model('Event', eventSchema);
