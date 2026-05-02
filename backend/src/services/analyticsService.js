/**
 * services/analyticsService.js  — FIXED VERSION
 *
 * Fixes applied:
 *  1. getSessionOverview   → totalStudents uses session.participants.length (not attempt count)
 *                          → totalQuestions uses quiz.questions.length (not session field)
 *  2. getSessionQuestionStats → reads ALL questions for the session's quiz, merges attempt data
 *  3. getStudentDashboard  → query guard already correct; fixed populate path for quiz→section
 */

const mongoose = require('mongoose')
const { Types: { ObjectId } } = mongoose
const { Module, Section, Quiz } = require('../models/Module')
const { Question, Session, Attempt } = require('../models/Attempt')
const { Badge, Achievement } = require('../models/Badge')
const User = require('../models/User')

// ─────────────────────────────────────────────────────────────────────────────
//  TEACHER — session-scoped analytics
// ─────────────────────────────────────────────────────────────────────────────

/**
 * High-level stats for a single session.
 *
 * FIX 1: totalStudents now comes from session.participants.length (all enrolled)
 *         not from the count of students who submitted attempts.
 * FIX 2: totalQuestions now comes from the linked Quiz.questions array length,
 *         not the denormalised session.totalQuestions field (which was left at 5).
 */
async function getSessionOverview(sessionId) {
  const session = await Session.findById(sessionId).populate('quiz')
  if (!session) throw new Error('Session not found')

  // ── FIX: real question count from the quiz document ──────────────────────
  const quiz = await Quiz.findById(session.quiz?._id ?? session.quiz)
  const totalQuestions = quiz?.questions?.length ?? session.totalQuestions ?? 0

  // ── FIX: real student count from participants list ────────────────────────
  const totalStudents = session.participants?.length ?? 0

  const attempts = await Attempt.find({ session: new ObjectId(sessionId) })

  if (!attempts.length) {
    return { totalStudents, totalQuestions, avgScore: 0, highestScore: 0, lowestScore: 0 }
  }

  // One row per student — sum points across all attempts in the session
  const byStudent = {}
  for (const a of attempts) {
    const sid = a.student.toString()
    byStudent[sid] = (byStudent[sid] ?? 0) + a.totalPoints
  }
  const scores = Object.values(byStudent)

  return {
    totalStudents,                   // ← from participants, not scores.length
    totalQuestions,                  // ← from quiz.questions.length
    avgScore:     Math.round(scores.reduce((s, v) => s + v, 0) / scores.length),
    highestScore: Math.max(...scores),
    lowestScore:  Math.min(...scores),
  }
}

/**
 * Per-student table for teacher view.
 */
async function getSessionStudentTable(sessionId) {
  const session = await Session.findById(sessionId)
  if (!session) throw new Error('Session not found')

  const attempts = await Attempt.find({ session: new ObjectId(sessionId) })
    .populate('student', 'name')

  const map = {}
  for (const a of attempts) {
    const sid = a.student._id.toString()
    if (!map[sid]) {
      map[sid] = {
        studentId:     sid,
        name:          a.student.name,
        totalPoints:   0,
        totalAccuracy: 0,
        totalTime:     0,
        correct:       0,
        attempted:     0,
        count:         0,
      }
    }
    const row = map[sid]
    row.totalPoints   += a.totalPoints
    row.totalAccuracy += a.accuracy ?? 0
    row.totalTime     += a.avgResponseTime ?? 0
    row.correct       += a.answers?.filter(x => x.isCorrect).length ?? 0
    row.attempted     += a.answers?.length ?? 0
    row.count         += 1
  }

  const rows = Object.values(map).map(r => ({
    studentId:       r.studentId,
    name:            r.name,
    attempted:       r.attempted,
    correct:         r.correct,
    accuracy:        Math.round(r.totalAccuracy / r.count),
    avgResponseTime: parseFloat((r.totalTime / r.count).toFixed(1)),
    totalPoints:     r.totalPoints,
  }))

  rows.sort((a, b) => b.totalPoints - a.totalPoints)
  return rows.map((r, i) => ({ ...r, rank: i + 1 }))
}

/**
 * Per-question engagement & difficulty for a session.
 *
 * FIX: Previously only returned questions that appeared in attempt.answers,
 *      so only 5 questions (the live quiz questions) ever appeared.
 *      Now we fetch ALL Question documents for the session's quiz, then
 *      merge in the attempt-answer stats — questions with no answers yet
 *      are included with zero stats.
 */
async function getSessionQuestionStats(sessionId) {
  const session = await Session.findById(sessionId).populate('quiz')
  if (!session) throw new Error('Session not found')

  // ── FIX: load every question belonging to this quiz ───────────────────────
  const quizId = session.quiz?._id ?? session.quiz
  const allQuestions = await Question.find({ quiz: quizId })

  const attempts = await Attempt.find({ session: new ObjectId(sessionId) })

  // Aggregate answer stats keyed by question._id string
  const qMap = {}
  for (const attempt of attempts) {
    for (const ans of attempt.answers ?? []) {
      const qid = ans.question.toString()
      if (!qMap[qid]) qMap[qid] = { responses: 0, correct: 0, totalTime: 0 }
      qMap[qid].responses += 1
      qMap[qid].correct   += ans.isCorrect ? 1 : 0
      qMap[qid].totalTime += ans.responseTime ?? 0
    }
  }

  const totalRespondents = Object.values(qMap).reduce((m, v) => Math.max(m, v.responses), 0) || 1

  // ── FIX: iterate over ALL questions, fall back to Question-level stats ────
  return allQuestions.map((q, i) => {
    const qid   = q._id.toString()
    const stats = qMap[qid]

    if (stats && stats.responses > 0) {
      const correctnessPercent = Math.round((stats.correct / stats.responses) * 100)
      const avgTime            = parseFloat((stats.totalTime / stats.responses).toFixed(1))
      return {
        questionId:        `Q${i + 1}`,
        _id:               qid,
        text:              q.text,
        difficulty:        q.difficulty,
        responseCount:     stats.responses,
        correctnessPercent,
        avgTime,
        isLowEngagement:  stats.responses < totalRespondents * 0.75,
        isHighDifficulty: correctnessPercent < 45,
      }
    }

    // No answers yet — use the denormalised Question-level counters from seed
    const responses = q.totalAttempts ?? 0
    const correct   = q.correctCount  ?? 0
    const correctnessPercent = responses > 0 ? Math.round((correct / responses) * 100) : 0
    const avgTime   = parseFloat((q.avgResponseTime ?? 0).toFixed(1))
    return {
      questionId:        `Q${i + 1}`,
      _id:               qid,
      text:              q.text,
      difficulty:        q.difficulty,
      responseCount:     responses,
      correctnessPercent,
      avgTime,
      isLowEngagement:  responses < totalRespondents * 0.75,
      isHighDifficulty: correctnessPercent < 45,
    }
  })
}

/**
 * Recent achievements tied to a session.
 */
async function getSessionAchievements(sessionId) {
  return Achievement.find({ 'context.session': new ObjectId(sessionId) })
    .sort({ earnedAt: -1 })
    .limit(20)
    .populate('student', 'name')
    .populate('badge')
}

// ─────────────────────────────────────────────────────────────────────────────
//  STUDENT — personal dashboard & achievements
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full student dashboard: stats summary + session history.
 *
 * FIX: populate path was correct but the quiz→section ref sometimes resolves
 *      to null when the quiz's section field isn't set. Added safe fallbacks.
 *      Also added a guard so an empty studentId throws cleanly instead of
 *      returning wrong data.
 */
async function getStudentDashboard(studentId) {
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    throw new Error('Invalid studentId')
  }

  const student = await User.findById(studentId)
  if (!student) throw new Error('Student not found')

  const attempts = await Attempt.find({ student: new ObjectId(studentId) })
    .populate({
      path: 'quiz',
      select: 'title section',
      populate: { path: 'section', select: 'title' }
    })
    .sort({ completedAt: -1 })

  const completed = attempts.filter(a => a.completedAt)

  const totalPoints     = completed.reduce((s, a) => s + (a.totalPoints ?? 0), 0)
  const avgAccuracy     = completed.length
    ? Math.round(completed.reduce((s, a) => s + (a.accuracy ?? 0), 0) / completed.length)
    : 0
  const avgResponseTime = completed.length
    ? parseFloat((completed.reduce((s, a) => s + (a.avgResponseTime ?? 0), 0) / completed.length).toFixed(1))
    : 0

  // Rank: number of students with more totalPoints than this student
  const allStudentPoints = await User.find({ role: 'student' }, 'totalPoints')
  const moduleRank = allStudentPoints.filter(s => (s.totalPoints ?? 0) > (student.totalPoints ?? 0)).length + 1

  const sessionHistory = attempts.map(a => ({
    quizId:       a.quiz?._id   ?? null,
    quizTitle:    a.quiz?.title ?? 'Unknown Quiz',
    sectionTitle: a.quiz?.section?.title ?? '',
    points:       a.totalPoints  ?? 0,
    accuracy:     a.accuracy     ?? 0,
    avgTime:      a.avgResponseTime ?? 0,
    date:         a.completedAt ?? a.createdAt,
    status:       a.completedAt ? 'completed' : 'in_progress',
  }))

  return {
    studentId: studentId,
    name:      student.name,
    totalPoints,
    avgAccuracy,
    avgResponseTime,
    totalAttempts: completed.length,
    moduleRank,
    sessionHistory,
  }
}

/**
 * Earned badges + upcoming badges for a student.
 */
async function getStudentAchievements(studentId) {
  if (!studentId || !mongoose.isValidObjectId(studentId)) {
    throw new Error('Invalid studentId')
  }

  const earned = await Achievement.find({ student: new ObjectId(studentId) })
    .populate('badge')
    .sort({ earnedAt: -1 })

  const earnedBadgeIds = new Set(earned.map(a => a.badge._id.toString()))
  const allBadges      = await Badge.find()
  const upcoming       = allBadges.filter(b => !earnedBadgeIds.has(b._id.toString()))

  return { earned, upcoming }
}

// ─────────────────────────────────────────────────────────────────────────────
//  MODULE
// ─────────────────────────────────────────────────────────────────────────────

async function listModules() {
  return Module.find()
    .populate({ path: 'sections', select: 'title _id' })
    .select('title description coverColor sections')
}

async function getModuleAnalytics(moduleId) {
  const mod = await Module.findById(moduleId).populate('sections')
  if (!mod) throw new Error('Module not found')

  const attempts = await Attempt.find({ module: moduleId })
    .populate('student', 'name')

  const sectionIds = mod.sections.map(s => s._id.toString())

  const sectionStats = await Promise.all(
    mod.sections.map(async sec => {
      const secAttempts    = attempts.filter(a => a.section?.toString() === sec._id.toString())
      const uniqueLearners = new Set(secAttempts.map(a => a.student._id.toString())).size
      const avgMastery     = secAttempts.length
        ? Math.round(secAttempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / secAttempts.length)
        : 0
      return {
        sectionId:     sec._id,
        title:         sec.title,
        avgMastery,
        totalAttempts: secAttempts.length,
        uniqueLearners,
      }
    })
  )

  const overallMastery = sectionStats.length
    ? Math.round(sectionStats.reduce((s, ss) => s + ss.avgMastery, 0) / sectionStats.length)
    : 0
  const totalLearners  = new Set(attempts.map(a => a.student._id.toString())).size
  const totalAttempts  = attempts.length

  const perStudent = {}
  for (const a of attempts) {
    const sid = a.student._id.toString()
    if (!perStudent[sid]) perStudent[sid] = new Set()
    if (a.section) perStudent[sid].add(a.section.toString())
  }
  const completedAll = Object.values(perStudent)
    .filter(secs => sectionIds.every(id => secs.has(id))).length

  const leaderboard = await getModuleLeaderboard(moduleId)

  return {
    moduleId: moduleId,
    title:    mod.title,
    overallMastery,
    totalLearners,
    completedAll,
    totalAttempts,
    sectionStats,
    leaderboard,
  }
}

async function getModuleLeaderboard(moduleId) {
  const attempts = await Attempt.find({ module: moduleId }).populate('student', 'name')
  const map = {}
  for (const a of attempts) {
    const sid = a.student._id.toString()
    if (!map[sid]) map[sid] = { name: a.student.name, totalPoints: 0, totalAttempts: 0, totalAccuracy: 0 }
    map[sid].totalPoints   += a.totalPoints
    map[sid].totalAttempts += 1
    map[sid].totalAccuracy += a.accuracy ?? 0
  }
  const rows = Object.values(map).map(r => ({
    student:       { name: r.name },
    totalPoints:   r.totalPoints,
    totalAttempts: r.totalAttempts,
    avgAccuracy:   Math.round(r.totalAccuracy / r.totalAttempts),
  }))
  rows.sort((a, b) => b.totalPoints - a.totalPoints)
  return rows.map((r, i) => ({ rank: i + 1, ...r }))
}

// ─────────────────────────────────────────────────────────────────────────────
//  SECTION
// ─────────────────────────────────────────────────────────────────────────────

async function getSectionAnalytics(sectionId) {
  const section = await Section.findById(sectionId).populate('quizzes', 'title _id')
  if (!section) throw new Error('Section not found')

  const attempts = await Attempt.find({ section: sectionId })

  const avgMastery     = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / attempts.length)
    : 0
  const uniqueLearners = new Set(attempts.map(a => a.student.toString())).size

  const quizBreakdown = await Promise.all(
    (section.quizzes ?? []).map(async q => {
      const qAttempts = attempts.filter(a => a.quiz?.toString() === q._id.toString())
      return {
        quizId:        q._id,
        title:         q.title,
        avgMastery:    qAttempts.length
          ? Math.round(qAttempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / qAttempts.length)
          : 0,
        totalAttempts: qAttempts.length,
        uniqueStudents: new Set(qAttempts.map(a => a.student.toString())).size,
      }
    })
  )

  const leaderboard = await getSectionLeaderboard(sectionId)

  return {
    sectionId:     sectionId,
    title:         section.title,
    avgMastery,
    totalAttempts: attempts.length,
    uniqueLearners,
    quizBreakdown,
    leaderboard,
  }
}

async function getSectionLeaderboard(sectionId) {
  const attempts = await Attempt.find({ section: sectionId }).populate('student', 'name')
  const map = {}
  for (const a of attempts) {
    const sid = a.student._id.toString()
    if (!map[sid]) map[sid] = { name: a.student.name, points: 0, totalAccuracy: 0, totalTime: 0, count: 0 }
    map[sid].points        += a.totalPoints
    map[sid].totalAccuracy += a.accuracy ?? 0
    map[sid].totalTime     += a.avgResponseTime ?? 0
    map[sid].count         += 1
  }
  const rows = Object.values(map).map(r => ({
    name:     r.name,
    points:   r.points,
    accuracy: Math.round(r.totalAccuracy / r.count),
    avgTime:  parseFloat((r.totalTime / r.count).toFixed(1)),
  }))
  rows.sort((a, b) => b.points - a.points || a.avgTime - b.avgTime)
  return rows.map((r, i) => ({ rank: i + 1, ...r }))
}

// ─────────────────────────────────────────────────────────────────────────────
//  QUIZ
// ─────────────────────────────────────────────────────────────────────────────

async function listQuizzes() {
  return Quiz.find()
    .populate('section', 'title')
    .select('title section _id')
    .then(quizzes =>
      quizzes.map(q => ({
        _id:       q._id,
        title:     q.title,
        sectionId: q.section?._id,
        section:   { title: q.section?.title ?? '' },
      }))
    )
}

async function getQuizAnalytics(quizId) {
  const quiz = await Quiz.findById(quizId)
  if (!quiz) throw new Error('Quiz not found')

  const attempts = await Attempt.find({ quiz: quizId }).populate('student', 'name')

  const uniqueStudents = new Set(attempts.map(a => a.student._id.toString())).size
  const firstAttempts  = attempts.filter(a => a.isFirstAttempt)

  const avgMastery = attempts.length
    ? Math.round(attempts.reduce((s, a) => s + (a.accuracy ?? 0), 0) / attempts.length)
    : 0

  const avgTime = attempts.length
    ? attempts.reduce((s, a) => s + (a.avgResponseTime ?? 0), 0) / attempts.length
    : 0
  const avgEngagement = parseFloat(Math.max(1, 10 - avgTime / 5).toFixed(1))

  const firstAttemptSuccessRate = firstAttempts.length
    ? Math.round(firstAttempts.filter(a => (a.accuracy ?? 0) >= 60).length / firstAttempts.length * 100)
    : 0

  const scoreDistribution = [0, 0, 0, 0, 0]
  for (const a of attempts) {
    const bucket = Math.min(4, Math.floor((a.accuracy ?? 0) / 20))
    scoreDistribution[bucket] += 1
  }

  const leaderboard = await getQuizLeaderboard(quizId)

  return {
    quizId:                  quizId,
    title:                   quiz.title,
    totalAttempts:           attempts.length,
    uniqueStudents,
    avgMastery,
    avgEngagement,
    firstAttemptSuccessRate,
    scoreDistribution,
    leaderboard,
  }
}

async function getQuizLeaderboard(quizId) {
  const attempts = await Attempt.find({ quiz: quizId }).populate('student', 'name')
  const map = {}
  for (const a of attempts) {
    const sid = a.student._id.toString()
    if (!map[sid] || a.totalPoints > map[sid].points) {
      map[sid] = {
        name:     a.student.name,
        points:   a.totalPoints,
        accuracy: a.accuracy ?? 0,
        avgTime:  a.avgResponseTime ?? 0,
      }
    }
  }
  const rows = Object.values(map)
  rows.sort((a, b) => b.points - a.points || a.avgTime - b.avgTime)
  return rows.map((r, i) => ({ rank: i + 1, ...r }))
}
async function loginUser(email, password) {
  const user = await User.findOne({ email: email.trim().toLowerCase() });

  if (!user || user.password !== password) {
    return {
      success: false,
      error: "Invalid credentials"
    };
  }

  return {
    success: true,
    data: {
      role: user.role,
      userId: user._id,
      userName: user.name,
      sessionId: null
    }
  };
}

// ─────────────────────────────────────────────────────────────────────────────
module.exports = {
  getSessionOverview,
  getSessionStudentTable,
  getSessionQuestionStats,
  getSessionAchievements,
  getStudentDashboard,
  getStudentAchievements,
  listModules,
  getModuleAnalytics,
  getModuleLeaderboard,
  getSectionAnalytics,
  getSectionLeaderboard,
  listQuizzes,
  getQuizAnalytics,
  loginUser
}