/**
 * GET /api/google/oauth-callback
 * Handles Google OAuth2 callback, stores tokens, then redirects teacher to their portal
 */
const { db, setCors } = require('../_db');
const { createOAuth2Client } = require('../_google');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { code, state: userId, error } = req.query;

  // If user denied access
  if (error) {
    return res.redirect('/teacher.html?google_error=access_denied');
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code provided' });
  }

  try {
    const oauth2Client = createOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);

    // Store tokens for this teacher
    if (userId && db.googleTokens) {
      db.googleTokens[userId] = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date,
        token_type: tokens.token_type,
        scope: tokens.scope
      };
    }

    // Redirect back to teacher portal with success
    res.redirect('/teacher.html?google_connected=1');

  } catch (err) {
    console.error('OAuth callback error:', err);
    res.redirect('/teacher.html?google_error=token_exchange_failed');
  }
};
