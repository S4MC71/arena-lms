const app = require('../backend/api-app');

module.exports = (req, res) => {
  // DEBUG INTERCEPTOR
  if (req.url && req.url.includes('/debug')) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      success: true,
      receivedUrl: req.url,
      originalUrl: req.originalUrl || null,
      headers: req.headers
    }));
    return;
  }

  // Restore the URL if Vercel mangles it
  if (req.url && !req.url.startsWith('/api') && !req.url.includes('.js')) {
    req.url = '/api' + (req.url.startsWith('/') ? '' : '/') + req.url;
  }
  
  return app(req, res);
};
