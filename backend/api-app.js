const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ─── Import shared DB ─────────────────────────────────────────────────────────
const { db, createToken, verifyToken, setCors } = require('./_db');

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
const googleOAuthUrl = require('./google/oauth-url');
const googleOAuthCallback = require('./google/oauth-callback');
const googleClassroomCoursework = require('./google/classroom/coursework');
const googleClassroomGrades = require('./google/classroom/grades');
const schedulesStart = require('./schedules/start');

app.get('/api/google/oauth-url', (req, res) => googleOAuthUrl(req, res));
app.get('/api/google/oauth-callback', (req, res) => googleOAuthCallback(req, res));
app.post('/api/google/classroom/coursework', (req, res) => googleClassroomCoursework(req, res));
app.post('/api/google/classroom/grades', (req, res) => googleClassroomGrades(req, res));
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
  const newSched = {
    id: `SCH-${Date.now()}`,
    batchId,
    batchName: `Batch ${batchId.replace('B', '')}`,
    day: slot.split(',')[0],
    date: new Date().toISOString().split('T')[0],
    time: slot.split(',')[1] || 'TBD',
    teacherName,
    topic,
    status: 'UPCOMING',
    meetLink: null
  };
  db.schedules.push(newSched);
  res.json({ success: true, schedule: newSched });
});

// ─── Homeworks Routes ────────────────────────────────────────────────────────
app.get('/api/homeworks', requireAuth, (req, res) => {
  let homeworks = db.homeworks;
  if (req.user.role === 'student') {
    homeworks = db.homeworks.filter(hw => hw.batchId === req.user.batchId);
  }
  res.json({ success: true, homeworks });
});

app.post('/api/homeworks/submit', requireAuth, requireRole('student'), (req, res) => {
  const { homeworkId, content } = req.body;
  const hw = db.homeworks.find(h => h.id === homeworkId);
  if (!hw) return res.status(404).json({ error: 'Homework not found' });

  const existing = hw.submissions.find(s => s.studentId === req.user.id);
  if (existing) return res.status(400).json({ error: 'Already submitted' });

  hw.submissions.push({
    studentId: req.user.id,
    studentName: req.user.name,
    content,
    status: 'Pending',
    submittedAt: new Date().toISOString()
  });

  res.json({ success: true });
});

// ─── Chat Routes ─────────────────────────────────────────────────────────────
app.get('/api/chat/messages', requireAuth, (req, res) => {
  res.json({ success: true, messages: db.chatMessages });
});

app.post('/api/chat/send', requireAuth, (req, res) => {
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'Message text required' });

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

// Export the pure API app
module.exports = app;
