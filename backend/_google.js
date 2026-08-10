/**
 * Arena LMS — Google OAuth2 & API Helper
 * Shared by all Google API serverless functions
 */

const { OAuth2Client } = require('google-auth-library');
const { db } = require('./_db');

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

/**
 * Creates a new OAuth2 client using env credentials
 */
function createOAuth2Client() {
  return new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI || 'http://localhost:4000/api/google/oauth-callback'
  );
}

/**
 * Gets an authenticated OAuth2 client for a specific user
 * Returns null if no tokens found or credentials not configured
 */
function getAuthClientForUser(userId) {
  if (!process.env.GOOGLE_CLIENT_ID) return null;

  const tokens = db.googleTokens[userId];
  if (!tokens) return null;

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials(tokens);

  // Auto-refresh token if expired
  oauth2Client.on('tokens', (newTokens) => {
    if (newTokens.refresh_token) {
      db.googleTokens[userId] = { ...db.googleTokens[userId], ...newTokens };
    } else {
      db.googleTokens[userId] = { ...db.googleTokens[userId], access_token: newTokens.access_token, expiry_date: newTokens.expiry_date };
    }
  });

  return oauth2Client;
}

/**
 * Gets the teacher's auth client (first teacher in DB)
 */
function getTeacherAuthClient() {
  const teacherUser = db.users.find(u => u.role === 'teacher');
  if (!teacherUser) return null;
  return getAuthClientForUser(teacherUser.id);
}

/**
 * Checks if Google API credentials are configured
 */
function isGoogleConfigured() {
  return !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
}

/**
 * Generates the Google OAuth2 authorization URL for teacher sign-in
 */
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
