/**
 * Arena Web Security LMS - Shared In-Memory Database
 * Used by all Vercel Serverless API functions
 * NOTE: In production, replace with a real DB (PlanetScale / Supabase / MongoDB Atlas)
 */

const JWT_SECRET = process.env.JWT_SECRET || "arena_web_security_lms_secret_2026";

// Shared state persists between warm function invocations (not guaranteed across cold starts)
// For production persistence, use an external DB or KV store (Vercel KV / Upstash Redis)
global._arenaDb = global._arenaDb || {
  users: [
    { id: 'STD-1001', email: 'student1@arena.com', password: 'pass123', name: 'Tanvir Hossain',  role: 'student', avatar: 'TH', batchId: 'B1' },
    { id: 'STD-1002', email: 'student2@arena.com', password: 'pass123', name: 'Shakil Ahmed',    role: 'student', avatar: 'SA', batchId: 'B2' },
    { id: 'STD-1003', email: 'student3@arena.com', password: 'pass123', name: 'Nusrat Jahan',    role: 'student', avatar: 'NJ', batchId: 'B3' },
    { id: 'STD-1004', email: 'student4@arena.com', password: 'pass123', name: 'Arifur Rahman',   role: 'student', avatar: 'AR', batchId: 'B4' },
    { id: 'TCH-402',  email: 'teacher@arena.com',  password: 'pass123', name: 'Rahat Chowdhury', role: 'teacher', avatar: 'RC', title: 'Lead Security Instructor' },
    { id: 'AUD-001',  email: 'auditor@arena.com',  password: 'pass123', name: 'Arena Auditor',   role: 'auditor', avatar: 'AO', title: 'Super Admin' }
  ],

  schedules: [
    {
      id: 'SCH-101', batchId: 'B1', batchName: 'Batch 1: Web Security & Bug Bounty',
      day: 'Thursday', date: '2026-08-13', time: '9:30 PM - 11:30 PM',
      teacherName: 'Rahat Chowdhury', topic: 'LFI/RFI Exploitation & PHP Filter Bypass',
      status: 'UPCOMING', meetLink: null
    },
    {
      id: 'SCH-102', batchId: 'B1', batchName: 'Batch 1: Web Security & Bug Bounty',
      day: 'Friday', date: '2026-08-14', time: '9:30 PM - 11:30 PM',
      teacherName: 'Rahat Chowdhury', topic: 'SQL Injection: Blind, Time-Based & OOB Exfiltration',
      status: 'LIVE', meetLink: null
    },
    {
      id: 'SCH-103', batchId: 'B2', batchName: 'Batch 2: API Security & DevSecOps',
      day: 'Saturday', date: '2026-08-15', time: '9:30 PM - 11:30 PM',
      teacherName: 'Rahat Chowdhury', topic: 'JWT Token Forgery & Key Injection Attacks',
      status: 'UPCOMING', meetLink: null
    },
    {
      id: 'SCH-104', batchId: 'B3', batchName: 'Batch 3: SOC & Threat Hunting',
      day: 'Saturday', date: '2026-08-15', time: '9:30 PM - 11:30 PM',
      teacherName: 'Rahat Chowdhury', topic: 'Malware Analysis & PCAP Log Investigation',
      status: 'UPCOMING', meetLink: null
    },
    {
      id: 'SCH-105', batchId: 'B4', batchName: 'Batch 4: Cloud Security',
      day: 'Thursday', date: '2026-08-20', time: '9:30 PM - 11:30 PM',
      teacherName: 'Rahat Chowdhury', topic: 'AWS IAM Privilege Escalation & S3 Hacking',
      status: 'UPCOMING', meetLink: null
    }
  ],

  homeworks: [
    {
      id: 'HW-201', batchId: 'B1',
      title: 'LFI Payload Exfiltration Report',
      description: 'Exploit the target using php://filter wrapper and document all steps in a PDF writeup. Include payloads, response analysis, and mitigation recommendations.',
      dueDate: 'Sunday 9:00 PM',
      maxScore: 100,
      attachment: 'lfi_lab_target.zip'
    },
    {
      id: 'HW-202', batchId: 'B1',
      title: 'SQLi Blind Exploitation Script',
      description: 'Write a Python script that automates time-based blind SQL injection to extract database version and table names.',
      dueDate: 'Monday 9:00 PM',
      maxScore: 100,
      attachment: 'sqli_target_config.txt'
    },
    {
      id: 'HW-203', batchId: 'B2',
      title: 'JWT Algorithm Confusion Attack',
      description: 'Demonstrate RS256 to HS256 algorithm confusion attack and forge an admin JWT token.',
      dueDate: 'Sunday 9:00 PM',
      maxScore: 100,
      attachment: 'jwt_target_api.postman.json'
    },
    {
      id: 'HW-301', batchId: 'B3',
      title: 'PCAP Malware Traffic Analysis',
      description: 'Analyze the provided PCAP file and identify C2 beaconing patterns, extract IOCs, and write a threat hunt report.',
      dueDate: 'Sunday 9:00 PM',
      maxScore: 100,
      attachment: 'malware_traffic.pcap'
    },
    {
      id: 'HW-401', batchId: 'B4',
      title: 'AWS IAM Privilege Escalation Lab',
      description: 'Using the provided AWS credentials, identify misconfigured IAM policies and escalate to admin privileges.',
      dueDate: 'Sunday 9:00 PM',
      maxScore: 100,
      attachment: 'aws_lab_creds.txt'
    }
  ],

  submissions: [
    {
      id: 'SUB-901', homeworkId: 'HW-201',
      studentId: 'STD-1001', studentName: 'Tanvir Hossain', batchId: 'B1',
      submittedAt: '2026-08-14 11:15 AM',
      content: 'Used php://filter/convert.base64-encode/resource=../../../etc/passwd to exfiltrate file contents.',
      driveFileUrl: '#', status: 'GRADED', score: 95,
      feedback: 'Excellent writeup! Great payload documentation.'
    }
  ],

  chatMessages: [
    { id: 'MSG-1', author: 'Rahat Chowdhury (Instructor)', role: 'teacher', text: 'Welcome everyone! Today we are covering SQLi exfiltration payloads. Please open your lab VMs.', time: '9:31 PM' },
    { id: 'MSG-2', author: 'Tanvir Hossain (Student)', role: 'student', text: 'Sir, is time-based blind SQLi applicable on PostgreSQL too?', time: '9:33 PM' },
    { id: 'MSG-3', author: 'Rahat Chowdhury (Instructor)', role: 'teacher', text: 'Yes! Use pg_sleep() instead of SLEEP(). For OOB use dblink_connect.', time: '9:34 PM' }
  ],

  attendanceLogs: [],

  liveStreamState: {
    isSharing: false,
    broadcasterName: null,
    frame: null,
    updatedAt: Date.now()
  },

  // Active Google Meet link for live class (set when teacher starts class)
  activeMeetLink: null,
  activeMeetScheduleId: null,

  // Google OAuth2 tokens (keyed by userId)
  // Structure: { [userId]: { access_token, refresh_token, expiry_date } }
  googleTokens: {},

  // Google Classroom Course IDs (keyed by batchId)
  // Structure: { [batchId]: { courseId, courseLink } }
  classroomCourses: {},

  // Google Classroom CourseWork IDs (keyed by Arena homeworkId)
  // Structure: { [hwId]: { courseWorkId, courseId } }
  classroomCourseWork: {}
};

const db = global._arenaDb;

// ─── JWT Helpers ─────────────────────────────────────────────────────────────
const crypto = require('crypto');

function createToken(user) {
  const b64 = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { id: user.id, email: user.email, role: user.role, name: user.name, iat: Math.floor(Date.now() / 1000) };
  const unsigned = `${b64(header)}.${b64(payload)}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64url');
  return `${unsigned}.${sig}`;
}

function verifyToken(authHeader) {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.split(' ')[1];
  try {
    const parts = token.split('.');
    const payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString());
    return db.users.find(u => u.id === payload.id) || null;
  } catch {
    return null;
  }
}

// ─── CORS Headers ─────────────────────────────────────────────────────────────
function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = { db, createToken, verifyToken, setCors };
