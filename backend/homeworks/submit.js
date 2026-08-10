const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user || user.role !== 'student') return res.status(403).json({ error: 'Students only' });

  const { homeworkId, content } = req.body;
  if (!homeworkId || !content?.trim()) {
    return res.status(400).json({ error: 'homeworkId and content are required' });
  }

  // Check if already submitted
  const existing = db.submissions.find(s => s.homeworkId === homeworkId && s.studentId === user.id);
  if (existing) return res.status(409).json({ error: 'Already submitted this homework' });

  const newSub = {
    id: `SUB-${Date.now()}`,
    homeworkId,
    studentId: user.id,
    studentName: user.name,
    batchId: user.batchId,
    submittedAt: new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }),
    content: content.trim(),
    driveFileUrl: null,
    status: 'SUBMITTED',
    score: null,
    feedback: 'Pending review by instructor.'
  };

  db.submissions.push(newSub);
  res.json({ success: true, submission: newSub, message: 'Homework submitted successfully! Instructor will review soon.' });
};
