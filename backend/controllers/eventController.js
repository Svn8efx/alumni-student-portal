const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');
const User = require('../models/User');
const notify = require('../utils/notify');

// @desc    Create an event/webinar
// @route   POST /api/events
// @access  Private/Alumni,Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, hostedBy: req.user._id });
  const populated = await event.populate('hostedBy', 'name company avatarUrl');

  // Notify all active users except the host — events are open to everyone.
  // (Fine at current scale; batch with insertMany if the user base grows large.)
  const recipients = await User.find({ isActive: true, _id: { $ne: req.user._id } }).select('_id').lean();
  const when = new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  for (const r of recipients) {
    await notify(req, {
      recipient: r._id,
      type: 'new_event',
      message: `${req.user.name} is hosting "${event.title}" on ${when}`,
      link: '/events',
      relatedId: event._id,
    });
  }

  res.status(201).json({ success: true, data: populated });
});

// @desc    List upcoming/past events
// @route   GET /api/events?when=upcoming
// @access  Private
const getEvents = asyncHandler(async (req, res) => {
  const { when = 'upcoming', page = 1, limit = 10 } = req.query;
  const query = when === 'upcoming' ? { date: { $gte: new Date() } } : { date: { $lt: new Date() } };

  const skip = (Number(page) - 1) * Number(limit);
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('hostedBy', 'name company avatarUrl')
      .sort({ date: when === 'upcoming' ? 1 : -1 })
      .skip(skip)
      .limit(Number(limit)),
    Event.countDocuments(query),
  ]);

  res.json({ success: true, data: events, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Register/unregister for an event (toggle)
// @route   PATCH /api/events/:id/register
// @access  Private
const toggleRegistration = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }

  const isRegistered = event.registrations.some((id) => id.toString() === req.user._id.toString());

  if (isRegistered) {
    event.registrations = event.registrations.filter((id) => id.toString() !== req.user._id.toString());
  } else {
    if (event.capacity > 0 && event.registrations.length >= event.capacity) {
      res.status(400);
      throw new Error('Event has reached full capacity');
    }
    event.registrations.push(req.user._id);
  }

  await event.save();
  res.json({ success: true, data: { registered: !isRegistered, registrationsCount: event.registrations.length } });
});

// @desc    Update/delete own event
const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.hostedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this event');
  }
  Object.assign(event, req.body);
  await event.save();
  res.json({ success: true, data: event });
});

const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    res.status(404);
    throw new Error('Event not found');
  }
  if (event.hostedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this event');
  }
  await event.deleteOne();
  res.json({ success: true, message: 'Event removed' });
});

module.exports = { createEvent, getEvents, toggleRegistration, updateEvent, deleteEvent };