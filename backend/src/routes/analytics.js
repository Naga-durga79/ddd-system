const express = require('express');
const router = express.Router();
const analytics = require('../services/analyticsService');
const { Attempt, Session } = require('../models/Attempt');
const { Module, Section, Quiz } = require('../models/Module');
const User = require('../models/User');
const { Achievement, Badge } = require('../models/Badge');

router.get('/bootstrap', async (req, res) => {
  try {
    const session = await Session.findOne({ status: 'live' }).sort({ startTime: -1 });
    const student = await User.findOne({ role: 'student' }).sort({ totalPoints: -1 });
    if (!session || !student) return res.status(404).json({ success: false, error: 'No seeded data.' });
    res.json({ success: true, data: { sessionId: session._id.toString(), studentId: student._id.toString(), studentName: student.name } });
  } catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/teacher/session/:sessionId/overview', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSessionOverview(req.params.sessionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/teacher/session/:sessionId/students', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSessionStudentTable(req.params.sessionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/teacher/session/:sessionId/questions', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSessionQuestionStats(req.params.sessionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/teacher/session/:sessionId/achievements', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSessionAchievements(req.params.sessionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/student/:studentId/dashboard', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getStudentDashboard(req.params.studentId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/student/:studentId/achievements', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getStudentAchievements(req.params.studentId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/modules', async (req, res) => {
  try { res.json({ success: true, data: await analytics.listModules() }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/module/:moduleId/analytics', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getModuleAnalytics(req.params.moduleId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/module/:moduleId/leaderboard', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getModuleLeaderboard(req.params.moduleId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/section/:sectionId/analytics', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSectionAnalytics(req.params.sectionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/section/:sectionId/leaderboard', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getSectionLeaderboard(req.params.sectionId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/quizzes', async (req, res) => {
  try { res.json({ success: true, data: await analytics.listQuizzes() }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/quiz/:quizId/analytics', async (req, res) => {
  try { res.json({ success: true, data: await analytics.getQuizAnalytics(req.params.quizId) }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});

router.get('/sessions', async (req, res) => {
  try { res.json({ success: true, data: await Session.find({}).select('_id status startTime quiz') }); }
  catch (err) { res.status(500).json({ success: false, error: err.message }); }
});


module.exports = router;
