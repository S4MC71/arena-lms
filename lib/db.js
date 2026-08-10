/**
 * Arena Web Security LMS - Shared Database & Auth Helper
 */

const crypto = require('crypto');

const JWT_SECRET = process.env.JWT_SECRET || "arena_web_security_lms_secret_2026";

global._arenaDb = global._arenaDb || {
  users: [
    { id: 'STD-1001', email: 'student1@arena.com', password: 'pass123', name: 'Tanvir Hossain',  role: 'student', avatar: 'TH', batchId: 'B1' },
    { id: 'STD-1002', email: 'student2@arena.com', password: 'pass123', name: 'Shakil Ahmed',    role: 'student', avatar: 'SA', batchId: 'B2' },
    { id: 'STD-1003', email: 'student3@arena.com', password: 'pass123', name: 'Nusrat Jahan',    role: 'student', avatar: 'NJ', batchId: 'B3' },
    { id: 'STD-1004', email: 'student4@arena.com', password: 'pass123', name: 'Arifur Rahman',   role: 'student', avatar: 'AR', batchId: 'B4' },
    { id: 'TCH-402',  email: 'teacher@arena.com',  password: 'pass123', name: 'Rahat Chowdhury', role: 'teacher', avatar: 'RC', title: 'Lead Security Instructor' },
    { id: 'TCH-403',  email: 'teacher2@arena.com', password: 'pass123', name: 'Mahfuzur Rahman', role: 'teacher', avatar: 'MR', title: 'SOC & Mobile Pentesting Specialist' },
    { id: 'AUD-001',  email: 'auditor@arena.com',  password: 'pass123', name: 'Arena Auditor',   role: 'auditor', avatar: 'AO', title: 'Super Admin' }
  ],

  schedules: [],

  homeworks: [
    {
      id: 'HW-201', batchId: 'B1',
      title: 'PHP Filter Wrapper LFI Challenge',
      dueDate: '2026-08-14',
      description: 'Bypass the input validation on target machine 10.10.14.5 to read /flag.txt using PHP base64 filter wrappers. Submit your writeup with PoC screenshot.',
      submissions: [
        { studentId: 'STD-1001', studentName: 'Tanvir Hossain', status: 'Graded', score: '95/100', content: 'Used php://filter/convert.base64-encode/resource=index.php to read source code. Flag: ARENA{lfi_filt3r_byp4ss_2026}' }
      ]
    },
    {
      id: 'HW-202', batchId: 'B1',
      title: 'Blind Time-Based SQLi Script',
      dueDate: '2026-08-18',
      description: 'Write a Python script to extract database version from vulnerable endpoint using time delay (pg_sleep / SLEEP).',
      submissions: []
    }
  ],

  chatMessages: [
    { id: 'MSG-001', author: 'Rahat Chowdhury (Instructor)', role: 'teacher', text: 'Welcome to today’s Web Security session! Please stay muted during payload demonstration.', time: '09:30 PM' },
    { id: 'MSG-002', author: 'Tanvir Hossain (Student)', role: 'student', text: 'Sir, is payload encoding required for double URL decode bypass?', time: '09:34 PM' },
    { id: 'MSG-003', author: 'Rahat Chowdhury (Instructor)', role: 'teacher', text: 'Yes Tanvir, double url-encode %252f when WAF strips single urlencode.', time: '09:36 PM' }
  ],

  liveStreamState: {
    isSharing: false,
    broadcasterName: 'Rahat Chowdhury',
    frame: null,
    updatedAt: Date.now()
  },

  attendanceLogs: [
    { date: '2026-08-07', batchId: 'B1', batchName: 'Batch 1', studentName: 'Tanvir Hossain', studentId: 'STD-1001', status: 'Present', duration: '118 mins', joinedAt: '09:28 PM' },
    { date: '2026-08-07', batchId: 'B1', batchName: 'Batch 1', studentName: 'Shakil Ahmed',    studentId: 'STD-1002', status: 'Present', duration: '110 mins', joinedAt: '09:32 PM' },
    { date: '2026-08-08', batchId: 'B2', batchName: 'Batch 2', studentName: 'Nusrat Jahan',    studentId: 'STD-1003', status: 'Present', duration: '120 mins', joinedAt: '09:25 PM' }
  ],

  googleTokens: {},

  activeMeetLink: null,
  activeMeetScheduleId: null
};

const db = global._arenaDb;

function base64UrlEncode(str) {
  return Buffer.from(str).toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';
  return Buffer.from(base64, 'base64').toString('utf8');
}

function createToken(user) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name, iat: Math.floor(Date.now() / 1000) };
  const unsigned = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64')
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  return `${unsigned}.${sig}`;
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payloadStr = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadStr);
    return db.users.find(u => u.id === payload.id) || null;
  } catch {
    return null;
  }
}

module.exports = { db, createToken, verifyToken };
