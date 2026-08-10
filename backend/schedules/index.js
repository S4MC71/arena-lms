const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  let schedules = db.schedules;
  if (user.role === 'student') {
    schedules = db.schedules.filter(s => s.batchId === user.batchId);
  }

  res.json({ success: true, schedules });
};
