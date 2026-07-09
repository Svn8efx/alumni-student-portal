const asyncHandler = require('express-async-handler');
const Job = require('../models/Job');

// @desc    Post a job/internship (alumni or admin only)
// @route   POST /api/jobs
// @access  Private/Alumni,Admin
const createJob = asyncHandler(async (req, res) => {
  const job = await Job.create({ ...req.body, postedBy: req.user._id });
  const populated = await job.populate('postedBy', 'name company avatarUrl');
  res.status(201).json({ success: true, data: populated });
});

// @desc    List jobs with filters
// @route   GET /api/jobs?type=internship&search=react&page=1&limit=10
// @access  Private
const getJobs = asyncHandler(async (req, res) => {
  const { type, search, page = 1, limit = 10 } = req.query;
  const query = { isActive: true };
  if (type) query.type = type;
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);
  const [jobs, total] = await Promise.all([
    Job.find(query).populate('postedBy', 'name company avatarUrl').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    Job.countDocuments(query),
  ]);

  res.json({ success: true, data: jobs, pagination: { total, page: Number(page), pages: Math.ceil(total / limit) } });
});

// @desc    Update own job posting
// @route   PUT /api/jobs/:id
// @access  Private (owner or admin)
const updateJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to edit this posting');
  }
  Object.assign(job, req.body);
  await job.save();
  res.json({ success: true, data: job });
});

// @desc    Delete/deactivate a job posting
// @route   DELETE /api/jobs/:id
// @access  Private (owner or admin)
const deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) {
    res.status(404);
    throw new Error('Job posting not found');
  }
  if (job.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to delete this posting');
  }
  await job.deleteOne();
  res.json({ success: true, message: 'Job posting removed' });
});

module.exports = { createJob, getJobs, updateJob, deleteJob };
