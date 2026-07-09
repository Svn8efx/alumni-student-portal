const asyncHandler = require('express-async-handler');
const Event = require('../models/Event');

// @desc    Create an event/webinar
// @route   POST /api/events
// @access  Private/Alumni,Admin
const createEvent = asyncHandler(async (req, res) => {
  const event = await Event.create({ ...req.body, hostedBy: req.user._id });
  const populated = await event.populate('hostedBy', 'name company avatarUrl');
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
