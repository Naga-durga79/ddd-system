const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'teacher', 'cohost'], default: 'student' },
  avatar: { type: String, default: null },
  totalPoints: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastActiveDate: { type: Date, default: Date.now },
  badges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Badge' }],
  enrolledModules: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Index for analytics queries
userSchema.index({ role: 1, totalPoints: -1 });

module.exports = mongoose.model('User', userSchema);