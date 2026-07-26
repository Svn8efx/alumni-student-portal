const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// Return the full user document minus the password — the frontend stores this
// as the logged-in user, so it must contain every profile field (branch,
// company, currentYear, skills, ...) or pages like Profile render empty
// until the next full reload re-fetches /auth/me.
const sanitize = (user) => {
  const obj = user.toObject();
  delete obj.password;
  return obj;
};

// @desc    Register a new user (student or alumni)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, graduationYear, currentYear, branch, company, designation } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email and password are required');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('An account with this email already exists');
  }

  // Admins are never self-registered through the public form; they are seeded/promoted manually.
  const safeRole = role === 'alumni' ? 'alumni' : 'student';

  const user = await User.create({
    name,
    email,
    password,
    role: safeRole,
    branch,
    graduationYear: safeRole === 'alumni' ? graduationYear : undefined,
    company: safeRole === 'alumni' ? company : undefined,
    designation: safeRole === 'alumni' ? designation : undefined,
    currentYear: safeRole === 'student' ? currentYear : undefined,
  });

  res.status(201).json({
    success: true,
    data: {
      ...sanitize(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('This account has been deactivated. Contact the administrator.');
  }

  user.lastLoginAt = new Date();
  await user.save();

  res.json({
    success: true,
    data: {
      ...sanitize(user),
      token: generateToken(user._id, user.role),
    },
  });
});

// @desc    Get currently logged-in user's full profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.user });
});

module.exports = { registerUser, loginUser, getMe };