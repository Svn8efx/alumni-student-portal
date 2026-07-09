const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, 'Name is required'], trim: true },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    password: { type: String, required: true, minlength: 6, select: false },

    // role drives which dashboard & permissions the user gets
    role: {
      type: String,
      enum: ['student', 'alumni', 'admin'],
      default: 'student',
    },

    // Shared profile fields
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '', maxlength: 500 },
    branch: { type: String, default: '' }, // e.g. CSE, ECE
    linkedinUrl: { type: String, default: '' },

    // Student-specific
    currentYear: { type: Number }, // 1-4
    rollNumber: { type: String },

    // Alumni-specific
    graduationYear: { type: Number },
    company: { type: String, default: '' },
    designation: { type: String, default: '' },
    skills: [{ type: String }],
    isMentorAvailable: { type: Boolean, default: false },

    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

// Hash password before saving if it was modified
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare plaintext password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Useful text index for the alumni/student directory search
userSchema.index({ name: 'text', company: 'text', skills: 'text', bio: 'text' });

module.exports = mongoose.model('User', userSchema);
