const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// @desc    Update logged-in user's own profile
// @route   PUT /api/users/me
// @access  Private
const updateMyProfile = asyncHandler(async (req, res) => {
  const allowedFields = [
    'name', 'bio', 'avatarUrl', 'branch', 'linkedinUrl',
    'currentYear', 'rollNumber', // student
    'graduationYear', 'company', 'designation', 'skills', 'isMentorAvailable', // alumni
  ];

  const updates = {};
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  const user = await User.findByIdAndUpdate(req.user._id, updates, {
    new: true,
    runValidators: true,
  });

  res.json({ success: true, data: user });
});

// @desc    Get single public profile by id
// @route   GET /api/users/:id
// @access  Private
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

// @desc    Directory listing of alumni/students with search + filters
// @route   GET /api/users?role=alumni&branch=CSE&graduationYear=2022&company=Google&skill=react&search=amit&page=1&limit=12
// @access  Private
const getDirectory = asyncHandler(async (req, res) => {
  const { role, branch, graduationYear, company, skill, search, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };
  if (role) query.role = role;
  if (branch) query.branch = branch;
  if (graduationYear) query.graduationYear = Number(graduationYear);
  if (company) query.company = new RegExp(company, 'i');
  if (skill) query.skills = new RegExp(skill, 'i');
  if (search) query.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    User.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
    User.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: users,
    pagination: { total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
  });
});

// @desc    Admin: list all users (no isActive filter, includes deactivated)
// @route   GET /api/users/admin/all
// @access  Private/Admin
const adminGetAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, data: users });
});

// @desc    Admin: activate/deactivate or change role of a user
// @route   PATCH /api/users/admin/:id
// @access  Private/Admin
const adminUpdateUser = asyncHandler(async (req, res) => {
  const { isActive, role, isVerified } = req.body;
  const updates = {};
  if (isActive !== undefined) updates.isActive = isActive;
  if (role !== undefined) updates.role = role;
  if (isVerified !== undefined) updates.isVerified = isVerified;

  const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).select('-password');
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }
  res.json({ success: true, data: user });
});

module.exports = { updateMyProfile, getUserById, getDirectory, adminGetAllUsers, adminUpdateUser };
