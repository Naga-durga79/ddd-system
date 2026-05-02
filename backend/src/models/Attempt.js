const mongoose = require('mongoose');

// ─── Question ─────────────────────────────────────────────────────────────────
const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  type: { type: String, enum: ['mcq', 'true_false', 'short_answer'], default: 'mcq' },
  options: [{
    text: String,
    isCorrect: Boolean
  }],
  correctAnswer: String,
  points: { type: Number, default: 10 },
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  avgResponseTime: { type: Number, default: 0 }, // seconds
  totalAttempts: { type: Number, default: 0 },
  correctCount: { type: Number, default: 0 }
}, { timestamps: true });

questionSchema.index({ quiz: 1, difficulty: 1 });

// ─── Session ──────────────────────────────────────────────────────────────────
const sessionSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['waiting', 'live', 'completed'], default: 'waiting' },
  startTime: Date,
  endTime: Date,
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  totalQuestions: { type: Number, default: 0 },
  totalPoints: { type: Number, default: 0 },
  // Aggregated metrics computed post-session
  avgScore: { type: Number, default: 0 },
  highestScore: { type: Number, default: 0 },
  lowestScore: { type: Number, default: 0 },
  completionRate: { type: Number, default: 0 }
}, { timestamps: true });

sessionSchema.index({ quiz: 1, status: 1, teacher: 1 });

// ─── Attempt ──────────────────────────────────────────────────────────────────
const attemptSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module' },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section' },
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedOption: String,
    isCorrect: Boolean,
    responseTime: Number, // seconds
    pointsEarned: Number
  }],
  totalPoints: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 }, // percentage
  avgResponseTime: { type: Number, default: 0 },
  completedAt: Date,
  attemptNumber: { type: Number, default: 1 }, // how many times student attempted this quiz
  isFirstAttempt: { type: Boolean, default: true }
}, { timestamps: true });

attemptSchema.index({ student: 1, quiz: 1, session: 1 });
attemptSchema.index({ quiz: 1, totalPoints: -1 });

module.exports = {
  Question: mongoose.model('Question', questionSchema),
  Session: mongoose.model('Session', sessionSchema),
  Attempt: mongoose.model('Attempt', attemptSchema)
};