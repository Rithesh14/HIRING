const mongoose = require('mongoose');

const assessmentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['dsa', 'aptitude', 'interview'], required: true },
  questions: [{ type: mongoose.Schema.Types.Mixed }],
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date },
  score: { type: Number },
  status: { type: String, enum: ['started', 'completed'], default: 'started' },
});

module.exports = mongoose.model('Assessment', assessmentSchema);
