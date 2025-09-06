const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, select: false },
  phone: { type: String },
  experienceLevel: { type: String, enum: ['fresher', '1-3', '3+'], default: 'fresher' },
  preferredRole: { type: String },
  assessmentProgress: {
    dsa: {
      currentQuestion: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 10 },
      completedQuestions: [{ type: String }],
      answers: { type: Map, of: String },
      timeSpent: { type: Number, default: 0 },
    },
    aptitude: {
      currentQuestion: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 25 },
      answers: { type: Map, of: Number },
      markedForReview: [{ type: String }],
      timeSpent: { type: Number, default: 0 },
    },
    interview: {
      currentQuestion: { type: Number, default: 0 },
      totalQuestions: { type: Number, default: 8 },
      recordings: { type: Map, of: Boolean },
      timeSpent: { type: Number, default: 0 },
    },
  },
  assessmentHistory: [
    {
      date: { type: Date, default: Date.now },
      score: { type: Number },
      totalQuestions: { type: Number },
      timeSpent: { type: Number },
      completed: { type: Boolean, default: false },
    },
  ],
  createdAt: { type: Date, default: Date.now },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare passwords
userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
