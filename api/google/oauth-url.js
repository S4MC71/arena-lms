/**
 * GET /api/google/oauth-url
 * Returns the Google OAuth2 URL for teacher to connect their Google account
 */
const { verifyToken, setCors } = require('../_db');
const { getAuthUrl, isGoogleConfigured } = require('../_google');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'teacher') {
    return res.status(403).json({ error: 'Teachers only' });
  }

  if (!isGoogleConfigured()) {
    return res.status(503).json({
      error: 'Google API not configured',
      setup: true,
      message: 'Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in your .env file or Vercel environment variables.',
      docsUrl: 'https://console.cloud.google.com/'
    });
  }

  const authUrl = getAuthUrl(user.id);
  res.json({ success: true, authUrl });
};
