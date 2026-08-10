const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'Message text required' });

  const roleLabel = user.role === 'teacher' ? 'Instructor' : user.role === 'auditor' ? 'Auditor' : 'Student';
  const newMsg = {
    id: `MSG-${Date.now()}`,
    author: `${user.name} (${roleLabel})`,
    role: user.role,
    text: text.trim(),
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };

  db.chatMessages.push(newMsg);
  res.json({ success: true, message: newMsg });
};
