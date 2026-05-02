const mongoose = require('mongoose');

// ─── Module ───────────────────────────────────────────────────────────────────
const moduleSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sections: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Section' }],
  isPublished: { type: Boolean, default: false },
  coverColor: { type: String, default: '#6366f1' }
}, { timestamps: true });

moduleSchema.index({ teacher: 1 });

// ─── Section ─────────────────────────────────────────────────────────────────
const sectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  order: { type: Number, default: 0 },
  quizzes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }]
}, { timestamps: true });

sectionSchema.index({ module: 1, order: 1 });

// ─── Quiz ─────────────────────────────────────────────────────────────────────
const quizSchema = new mongoose.Schema({
  title: { type: String, required: true },
  section: { type: mongoose.Schema.Types.ObjectId, ref: 'Section', required: true },
  module: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }],
  maxPoints: { type: Number, default: 100 },
  timeLimit: { type: Number, default: 30 }, // minutes
  passingScore: { type: Number, default: 60 }
}, { timestamps: true });

quizSchema.index({ section: 1, module: 1 });

module.exports = {
  Module: mongoose.model('Module', moduleSchema),
  Section: mongoose.model('Section', sectionSchema),
  Quiz: mongoose.model('Quiz', quizSchema)
};