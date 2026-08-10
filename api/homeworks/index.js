const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  // Students see only their batch's homeworks
  let homeworks = db.homeworks;
  if (user.role === 'student') {
    homeworks = db.homeworks.filter(h => h.batchId === user.batchId);
  }

  // Get submissions for this user
  let submissions = db.submissions;
  if (user.role === 'student') {
    submissions = db.submissions.filter(s => s.studentId === user.id);
  }

  res.json({ success: true, homeworks, submissions });
};
