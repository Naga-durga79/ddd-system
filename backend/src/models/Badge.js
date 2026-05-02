const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  icon: String,        // emoji or icon name
  color: String,
  category: { type: String, enum: ['accuracy', 'speed', 'streak', 'completion', 'score', 'social'], default: 'score' },
  condition: {
    type: { type: String }, // 'accuracy_gte', 'streak_gte', 'score_gte', 'completion', etc.
    value: Number
  },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' }
}, { timestamps: true });

const achievementSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  badge: { type: mongoose.Schema.Types.ObjectId, ref: 'Badge', required: true },
  earnedAt: { type: Date, default: Date.now },
  context: {
    session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
  }
}, { timestamps: true });

achievementSchema.index({ student: 1, badge: 1 });

module.exports = {
  Badge: mongoose.model('Badge', badgeSchema),
  Achievement: mongoose.model('Achievement', achievementSchema)
};