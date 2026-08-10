const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'teacher') return res.status(403).json({ error: 'Teachers only' });

  const { scheduleId } = req.body;
  const sched = db.schedules.find(s => s.id === scheduleId);
  if (!sched) return res.status(404).json({ error: 'Schedule not found' });

  sched.status = 'COMPLETED';
  db.activeMeetLink = null;
  db.activeMeetScheduleId = null;
  db.liveStreamState.isSharing = false;
  db.liveStreamState.frame = null;

  res.json({ success: true, schedule: sched });
};
