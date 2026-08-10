const app = require('../backend/api-app');

module.exports = (req, res) => {
  // Vercel sometimes strips the /api prefix or passes the destination path.
  // This ensures Express always sees the full path (e.g. /api/auth/login) so routes match.
  if (req.url && !req.url.startsWith('/api')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  return app(req, res);
};
