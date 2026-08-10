/**
 * Arena LMS — Google OAuth2 & API Helper for Next.js
 */

const { OAuth2Client } = require('google-auth-library');
const { db } = require('./db');

const SCOPES = [
  'https://www.googleapis.com/auth/classroom.courses',
  'https://www.googleapis.com/auth/classroom.coursework.students',
  'https://www.googleapis.com/auth/classroom.coursework.me',
  'https://www.googleapis.com/auth/classroom.rosters',
  'https://www.googleapis.com/auth/classroom.announcements',
  'https://www.googleapis.com/auth/meetings.space.created',
  'https://www.googleapis.com/auth/drive.file',
  'openid',
  'email',
  'profile'
];

function getRedirectUri() {
  if (process.env.GOOGLE_REDIRECT_URI) return process.env.GOOGLE_REDIRECT_URI;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api/google/oauth-callback`;
  return 'http://localhost:3000/api/google/oauth-callback';
}

function createOAuth2Client() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    getRedirectUri()
  );
}

function getAuthClientForUser(userId) {
  if (!process.env.GOOGLE_CLIENT_ID) return null;

  const tokens = db.googleTokens[userId];
  if (!tokens) return null;

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  oauth2Client.on('tokens', (newTokens) => {
    if (newTokens.refresh_token) {
      db.googleTokens[userId] = { ...db.googleTokens[userId], ...newTokens };
    } else {
      db.googleTokens[userId] = { ...db.googleTokens[userId], access_token: newTokens.access_token, expiry_date: newTokens.expiry_date };
    }
  });

  return oauth2Client;
}

function getTeacherAuthClient() {
  const teacherUser = db.users.find(u => u.role === 'teacher');
  if (!teacherUser) return null;
  return getAuthClientForUser(teacherUser.id);
}

function isGoogleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

function getAuthUrl(state = '') {
  const oauth2Client = createOAuth2Client();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent',
    state
  });
}

module.exports = {
  SCOPES,
  createOAuth2Client,
  getAuthClientForUser,
  getTeacherAuthClient,
  isGoogleConfigured,
  getAuthUrl
};
