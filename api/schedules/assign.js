const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'auditor') return res.status(403).json({ error: 'Auditors only' });

  const { batchId, slot, teacherName, topic } = req.body;
  if (!batchId || !slot || !teacherName || !topic) {
    return res.status(400).json({ error: 'batchId, slot, teacherName and topic are required' });
  }

  const batch = db.users.find(u => u.batchId === batchId);
  const batchName = {
    B1: 'Batch 1: Web Security & Bug Bounty',
    B2: 'Batch 2: API Security & DevSecOps',
    B3: 'Batch 3: SOC & Threat Hunting',
    B4: 'Batch 4: Cloud Security'
  }[batchId] || batchId;

  const newSchedule = {
    id: `SCH-${Date.now()}`,
    batchId,
    batchName,
    day: slot.split(' ')[0],
    date: new Date().toISOString().split('T')[0],
    time: slot.includes('9:30') ? '9:30 PM - 11:30 PM' : slot,
    teacherName,
    topic,
    status: 'UPCOMING',
    meetLink: null
  };

  db.schedules.push(newSchedule);
  res.json({ success: true, schedule: newSchedule, message: 'Class assigned and Meet session will be created when teacher starts.' });
};
