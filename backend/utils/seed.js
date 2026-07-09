/**
 * Populates the database with demo accounts for faculty demonstration.
 * Run with: npm run seed
 *
 * Creates one admin, two alumni, and two students, all with password: Passw0rd!
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@krmu.edu.in',
    password: 'Passw0rd!',
    role: 'admin',
    isVerified: true,
  },
  {
    name: 'Priyanshu Kathuria',
    email: 'priyanshu.alumni@krmu.edu.in',
    password: 'Passw0rd!',
    role: 'alumni',
    branch: 'CSE',
    graduationYear: 2023,
    company: 'Microsoft',
    designation: 'Software Engineer',
    skills: ['React', 'Node.js', 'System Design'],
    isMentorAvailable: true,
    bio: 'Happy to mentor students on placements and full-stack development.',
    isVerified: true,
  },
  {
    name: 'Aradhana Singh',
    email: 'aradhana.alumni@krmu.edu.in',
    password: 'Passw0rd!',
    role: 'alumni',
    branch: 'CSE',
    graduationYear: 2022,
    company: 'Amazon',
    designation: 'SDE II',
    skills: ['AWS', 'Java', 'Distributed Systems'],
    isMentorAvailable: true,
    bio: 'Alumni mentor focused on backend engineering and interview prep.',
    isVerified: true,
  },
  {
    name: 'Sarthak Gupta',
    email: 'sarthak.student@krmu.edu.in',
    password: 'Passw0rd!',
    role: 'student',
    branch: 'CSE',
    currentYear: 3,
    rollNumber: '2501350021',
    bio: 'Third-year CSE student interested in web development.',
  },
  {
    name: 'Anish Kumar Jha',
    email: 'anish.student@krmu.edu.in',
    password: 'Passw0rd!',
    role: 'student',
    branch: 'CSE',
    currentYear: 3,
    rollNumber: '2501010273',
    bio: 'Aspiring backend developer, actively seeking mentorship.',
  },
];

const run = async () => {
  await connectDB();
  await User.deleteMany({ email: { $in: seedUsers.map((u) => u.email) } });

  for (const userData of seedUsers) {
    await User.create(userData); // pre-save hook hashes the password
  }

  console.log(`Seeded ${seedUsers.length} demo users. Default password for all: Passw0rd!`);
  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
