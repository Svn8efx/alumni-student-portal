const mongoose = require('mongoose');

// Job / internship opportunity posted by an alumnus (or admin)
const jobSchema = new mongoose.Schema(
  {
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, maxlength: 150 },
    company: { type: String, required: true },
    type: {
      type: String,
      enum: ['internship', 'full-time', 'part-time', 'freelance'],
      default: 'internship',
    },
    location: { type: String, default: 'Remote' },
    description: { type: String, required: true, maxlength: 4000 },
    applyLink: { type: String, default: '' },
    skillsRequired: [{ type: String }],
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

jobSchema.index({ title: 'text', company: 'text', skillsRequired: 'text' });

module.exports = mongoose.model('Job', jobSchema);
