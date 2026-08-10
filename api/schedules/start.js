const { db, verifyToken, setCors } = require('../_db');
const { getAuthClientForUser } = require('../_google');
const { SpacesServiceClient } = require('@google-apps/meet');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { scheduleId, meetLink: providedMeetLink } = req.body;
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });

  sched.status = 'LIVE';
  
  let meetLink = providedMeetLink;

  // Auto-create Google Meet space if no link provided and teacher is connected
  if (!meetLink) {
    const authClient = getAuthClientForUser(user.id);
    if (authClient) {
      try {
        const meetClient = new SpacesServiceClient({ authClient });
        const [response] = await meetClient.createSpace({
          space: { config: { accessType: 'OPEN' } }
        });
        meetLink = response.meetingUri;
      } catch (err) {
        console.error('Error creating Google Meet space:', err);
        return res.status(500).json({ error: 'Failed to auto-create Google Meet session. Make sure Google Workspace permissions allow Meet creation.', details: err.message });
      }
    }
  }

  if (meetLink) sched.meetLink = meetLink;
  db.activeMeetLink = sched.meetLink;
  db.activeMeetScheduleId = sched.id;

  res.json({ success: true, schedule: sched, meetLink: sched.meetLink });
};
