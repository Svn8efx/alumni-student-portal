const express = require('express');
const router = express.Router();
const {
  createEvent,
  getEvents,
  toggleRegistration,
  updateEvent,
  deleteEvent,
} = require('../controllers/eventController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getEvents);
router.post('/', authorize('alumni', 'admin'), createEvent);
router.patch('/:id/register', toggleRegistration);
router.put('/:id', authorize('alumni', 'admin'), updateEvent);
router.delete('/:id', authorize('alumni', 'admin'), deleteEvent);

module.exports = router;
