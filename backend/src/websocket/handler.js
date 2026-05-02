const { Attempt } = require('../models/Attempt');
const { getStudentPerformanceTable } = require('../services/analyticsService');

// Connected room tracking
const sessionRooms = new Map(); // sessionId -> Set of socket ids

function initWebSocket(io) {
  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`);

    // ─── Join Session Room ───────────────────────────────────────────────────
    socket.on('join_session', ({ sessionId, role, userId }) => {
      socket.join(`session_${sessionId}`);
      socket.data = { sessionId, role, userId };
      console.log(`[WS] ${role} ${userId} joined session ${sessionId}`);
      socket.emit('joined', { sessionId, message: 'Connected to live session' });
    });

    // ─── Student Submits Answer ──────────────────────────────────────────────
    socket.on('submit_answer', async ({ sessionId, studentId, questionId, selectedOption, responseTime, isCorrect, pointsEarned }) => {
      try {
        // Update attempt in DB
        await Attempt.updateOne(
          { student: studentId, session: sessionId },
          {
            $push: { answers: { question: questionId, selectedOption, isCorrect, responseTime, pointsEarned } },
            $inc: { totalPoints: pointsEarned }
          },
          { upsert: true }
        );

        // Emit live score update to teacher room
        io.to(`session_${sessionId}`).emit('score_update', {
          studentId,
          questionId,
          isCorrect,
          pointsEarned,
          timestamp: new Date()
        });

        // Send refreshed leaderboard to teacher
        const leaderboard = await getStudentPerformanceTable(sessionId);
        io.to(`session_${sessionId}`).emit('leaderboard_update', { leaderboard });

      } catch (err) {
        socket.emit('error', { message: err.message });
      }
    });

    // ─── Achievement Unlock ──────────────────────────────────────────────────
    socket.on('achievement_unlocked', ({ sessionId, studentId, badge }) => {
      io.to(`session_${sessionId}`).emit('achievement_event', {
        studentId,
        badge,
        timestamp: new Date()
      });
    });

    // ─── Teacher Controls Session ────────────────────────────────────────────
    socket.on('session_control', ({ sessionId, action }) => {
      // action: 'start' | 'pause' | 'end'
      io.to(`session_${sessionId}`).emit('session_status_change', { action, timestamp: new Date() });
    });

    // ─── Next Question ───────────────────────────────────────────────────────
    socket.on('next_question', ({ sessionId, question, questionIndex }) => {
      io.to(`session_${sessionId}`).emit('question_broadcast', { question, questionIndex, timestamp: new Date() });
    });

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initWebSocket };