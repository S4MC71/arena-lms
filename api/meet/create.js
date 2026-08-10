const { db, verifyToken, setCors } = require('../_db');

/**
 * POST /api/meet/create
 *
 * Creates or retrieves a Google Meet link for a class session.
 *
 * HOW GOOGLE MEET INTEGRATION WORKS (Whitelabel):
 * ─────────────────────────────────────────────────
 * Option A (Current - Simple, No API Key needed):
 *   Teacher manually pastes their Google Meet link when starting a class.
 *   The link is stored in db and served to students via this API.
 *   Students join embedded in classroom.html iframe - they NEVER see the Meet UI label.
 *
 * Option B (Advanced - Full Google Meet REST API):
 *   Requires: Google Cloud Project + Google Meet API enabled + OAuth2 credentials.
 *   Flow: Teacher authenticates via OAuth → API creates a Meet space automatically
 *   → returns a meet.google.com link → stored and served to students.
 *   Docs: https://developers.google.com/meet/api/guides/overview
 *
 * IMPORTANT: Google Meet iframes are loaded with these permissions:
 *   allow="camera; microphone; display-capture; fullscreen"
 *   Students need to click "Join" inside the iframe but DON'T need a Google account
 *   if the meeting is configured to allow guest/anonymous join.
 */

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { scheduleId, meetLink } = req.body;
  if (!scheduleId) return res.status(400).json({ error: 'scheduleId required' });

  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });

  // If teacher provides a Meet link, store it
  if (meetLink && meetLink.startsWith('https://meet.google.com/')) {
    sched.meetLink = meetLink;
    db.activeMeetLink = meetLink;
    db.activeMeetScheduleId = scheduleId;
    sched.status = 'LIVE';
    return res.json({
      success: true,
      meetLink,
      scheduleId,
      message: 'Google Meet session activated! Students can now join.'
    });
  }

  // If no link provided, return instruction to teacher
  res.json({
    success: false,
    requiresMeetLink: true,
    message: 'Please create a Google Meet session and paste the link here.',
    instructions: [
      '1. Go to meet.google.com and click "New Meeting"',
      '2. Click "Start an instant meeting" or schedule one',
      '3. Copy the meeting link (meet.google.com/xxx-yyy-zzz)',
      '4. Paste the link back here to start the class'
    ]
  });
};
