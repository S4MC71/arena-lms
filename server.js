/**
 * Arena Web Security LMS — Local Development Server
 * 
 * This file is for LOCAL DEVELOPMENT only.
 * For production on Vercel, all API logic is in backend/api-app.js
 * 
 * Run: node server.js
 * Access: http://localhost:4000
 */

require('dotenv').config();
const express = require('express');
const path = require('path');

// Import the pure API app
const apiApp = require('./backend/api-app');

// Create the local server app
const app = express();

// Mount the API app
app.use(apiApp);

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// ─── Catch-all: serve login.html for any unmatched routes ─────────────────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html'));
});

// ─── Start Server ─────────────────────────────────────────────────────────────
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
