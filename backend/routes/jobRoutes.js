const express = require('express');
const router = express.Router();
const { createJob, getJobs, updateJob, deleteJob } = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getJobs);
router.post('/', authorize('alumni', 'admin'), createJob);
router.put('/:id', authorize('alumni', 'admin'), updateJob);
router.delete('/:id', authorize('alumni', 'admin'), deleteJob);

module.exports = router;
