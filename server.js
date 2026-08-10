/**
 * Arena Web Security LMS — Local Development Server
 * 
 * This file is for LOCAL DEVELOPMENT only.
 * For production on Vercel, all API logic is in /api/ serverless functions.
 * 
 * Run: node server.js
 * Access: http://localhost:4000
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// ─── Import shared DB ─────────────────────────────────────────────────────────
// Reuse the same DB module as the Vercel functions for consistency
const { db, createToken, verifyToken, setCors } = require('./backend/_db');

// ─── Auth Middleware ──────────────────────────────────────────────────────────
function requireAuth(req, res, next) {
  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Please login.' });
  req.user = user;
  next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    next();
  };
}

// ─── Auth Routes ─────────────────────────────────────────────────────────────
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

  const token = createToken(user);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  const { password: _, ...safeUser } = req.user;
  res.json({ success: true, user: safeUser });
});

// ─── Schedules Routes ────────────────────────────────────────────────────────
app.get('/api/schedules', requireAuth, (req, res) => {
  let schedules = db.schedules;
  if (req.user.role === 'student') {
    schedules = db.schedules.filter(s => s.batchId === req.user.batchId);
  }
  res.json({ success: true, schedules });
});

// ─── Google Integrations ───────────────────────────────────────────────────────
const googleOAuthUrl = require('./backend/google/oauth-url');
const googleOAuthCallback = require('./backend/google/oauth-callback');
const googleClassroomCoursework = require('./backend/google/classroom/coursework');
const googleClassroomGrades = require('./backend/google/classroom/grades');
const schedulesStart = require('./backend/schedules/start');

// Map serverless functions to Express routes
app.get('/api/google/oauth-url', (req, res) => googleOAuthUrl(req, res));
app.get('/api/google/oauth-callback', (req, res) => googleOAuthCallback(req, res));
app.post('/api/google/classroom/coursework', (req, res) => googleClassroomCoursework(req, res));
app.post('/api/google/classroom/grades', (req, res) => googleClassroomGrades(req, res));

// Replace the hardcoded /api/schedules/start with the actual serverless function that handles Meet auto-create
app.post('/api/schedules/start', (req, res) => schedulesStart(req, res));

app.post('/api/schedules/stop', requireAuth, requireRole('teacher'), (req, res) => {
  const { scheduleId } = req.body;
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });

  sched.status = 'COMPLETED';
  db.activeMeetLink = null;
  db.activeMeetScheduleId = null;
  db.liveStreamState.isSharing = false;
  db.liveStreamState.frame = null;

  res.json({ success: true, schedule: sched });
});

app.post('/api/schedules/assign', requireAuth, requireRole('auditor'), (req, res) => {
  const { batchId, slot, teacherName, topic } = req.body;
  if (!batchId || !slot || !teacherName || !topic) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const batchNames = {
    B1: 'Batch 1: Web Security & Bug Bounty',
    B2: 'Batch 2: API Security & DevSecOps',
    B3: 'Batch 3: SOC & Threat Hunting',
    B4: 'Batch 4: Cloud Security'
  };

  const newSchedule = {
    id: `SCH-${Date.now()}`,
    batchId,
    batchName: batchNames[batchId] || batchId,
    day: slot.split(' ')[0],
    date: new Date().toISOString().split('T')[0],
    time: '9:30 PM - 11:30 PM',
    teacherName,
    topic,
    status: 'UPCOMING',
    meetLink: null
  };

  db.schedules.push(newSchedule);
  res.json({ success: true, schedule: newSchedule });
});

// ─── Homeworks Routes ────────────────────────────────────────────────────────

app.get('/api/homeworks', requireAuth, (req, res) => {
  let homeworks = db.homeworks;
  if (req.user.role === 'student') {
    homeworks = db.homeworks.filter(h => h.batchId === req.user.batchId);
  }

  let submissions = db.submissions;
  if (req.user.role === 'student') {
    submissions = db.submissions.filter(s => s.studentId === req.user.id);
  }

  res.json({ success: true, homeworks, submissions });
});

app.post('/api/homeworks/submit', requireAuth, requireRole('student'), (req, res) => {
  const { homeworkId, content } = req.body;
  if (!homeworkId || !content?.trim()) return res.status(400).json({ error: 'homeworkId and content required' });

  const existing = db.submissions.find(s => s.homeworkId === homeworkId && s.studentId === req.user.id);
  if (existing) return res.status(409).json({ error: 'Already submitted this homework' });

  const newSub = {
    id: `SUB-${Date.now()}`,
    homeworkId,
    studentId: req.user.id,
    studentName: req.user.name,
    batchId: req.user.batchId,
    submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    content: content.trim(),
    driveFileUrl: null,
    status: 'SUBMITTED',
    score: null,
    feedback: 'Pending review by instructor.'
  };

  db.submissions.push(newSub);
  res.json({ success: true, submission: newSub });
});

// ─── Chat Routes ─────────────────────────────────────────────────────────────
app.get('/api/chat/messages', requireAuth, (req, res) => {
  res.json({ success: true, messages: db.chatMessages });
});

app.post('/api/chat/send', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Message text required' });

  const roleLabel = req.user.role === 'teacher' ? 'Instructor' : req.user.role === 'auditor' ? 'Auditor' : 'Student';
  const newMsg = {
    id: `MSG-${Date.now()}`,
    author: `${req.user.name} (${roleLabel})`,
    role: req.user.role,
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.chatMessages.push(newMsg);
  res.json({ success: true, message: newMsg });
});

// ─── Stream Routes ───────────────────────────────────────────────────────────
app.get('/api/stream/live', requireAuth, (req, res) => {
  res.json({
    success: true,
    stream: db.liveStreamState,
    activeMeetLink: db.activeMeetLink,
    activeMeetScheduleId: db.activeMeetScheduleId
  });
});

app.post('/api/stream/broadcast', requireAuth, (req, res) => {
  const { isSharing, frame } = req.body;
  db.liveStreamState = {
    isSharing: !!isSharing,
    broadcasterName: req.user.name,
    frame: frame || (isSharing ? db.liveStreamState.frame : null),
    updatedAt: Date.now()
  };
  res.json({ success: true });
});

// ─── Meet Routes ─────────────────────────────────────────────────────────────
app.post('/api/meet/create', requireAuth, requireRole('teacher'), (req, res) => {
  const { scheduleId, meetLink } = req.body;
  if (!scheduleId) return res.status(400).json({ error: 'scheduleId required' });

  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });

  if (meetLink && meetLink.startsWith('https://meet.google.com/')) {
    sched.meetLink = meetLink;
    db.activeMeetLink = meetLink;
    db.activeMeetScheduleId = scheduleId;
    sched.status = 'LIVE';
    return res.json({ success: true, meetLink, scheduleId });
  }

  res.json({
    success: false,
    requiresMeetLink: true,
    message: 'Please create a Google Meet and paste the link.'
  });
});

// ─── Attendance Routes ────────────────────────────────────────────────────────
app.get('/api/attendance', requireAuth, (req, res) => {
  res.json({ success: true, attendanceLogs: db.attendanceLogs });
});

// ─── Catch-all: serve index.html for any unmatched routes ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log('\n🛡️  Arena Web Security LMS — Development Server');
    console.log('═══════════════════════════════════════════════');
    console.log(`✅  Server running at: http://localhost:${PORT}`);
    console.log(`📋  Login page:        http://localhost:${PORT}/login.html`);
    console.log(`👨‍🏫  Teacher portal:    http://localhost:${PORT}/teacher.html`);
    console.log(`🎓  Student portal:    http://localhost:${PORT}/student.html`);
    console.log(`🛡️   Auditor portal:    http://localhost:${PORT}/auditor.html`);
    console.log(`🎥  Live Classroom:    http://localhost:${PORT}/classroom.html`);
    console.log('═══════════════════════════════════════════════');
    console.log('📝  Demo Accounts:');
    console.log('    student1@arena.com / pass123 → Batch 1');
    console.log('    teacher@arena.com  / pass123 → Teacher');
    console.log('    auditor@arena.com  / pass123 → Auditor');
    console.log('═══════════════════════════════════════════════\n');
  });
}

// Export for Vercel serverless function
module.exports = app;
