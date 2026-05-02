require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const analyticsRoutes = require('./routes/analytics');
const { initWebSocket } = require('./websocket/handler');

const app = express();
const server = http.createServer(app);

// ─── Socket.IO ────────────────────────────────────────────────────────────────
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});
initWebSocket(io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(morgan('dev'));
app.use(express.json());

// ─── Routes ───────────────────────────────────────────────────────────────────
// FIX: mount at /api so routes like /api/teacher/... and /api/modules/... resolve
app.use('/api', analyticsRoutes);
app.use('/api/auth', authRoutes);

// Bootstrap endpoint: frontend calls this once to get real MongoDB IDs
// Returns the live session ID + first student ID so the UI has real ObjectIds
app.get('/api/bootstrap', async (req, res) => {
  try {
    const { Session } = require('./models/Attempt');
    const User = require('./models/User');

    const session = await Session.findOne({ status: 'live' }).sort({ startTime: -1 });
    const student = await User.findOne({ role: 'student' }).sort({ totalPoints: -1 });

    if (!session || !student) {
      return res.status(404).json({ success: false, error: 'No seeded data found. Run the seeder first.' });
    }

    res.json({
      success: true,
      data: {
        sessionId: session._id.toString(),
        studentId: student._id.toString(),
        studentName: student.name,
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, error: e.message });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date() }));

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// ─── DB + Start ───────────────────────────────────────────────────────────────
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ddd_system';
const PORT = process.env.PORT || 5000;

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    server.listen(PORT, () => console.log(`🚀 DDD Server running on port ${PORT}`));
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  });

module.exports = { app, io };