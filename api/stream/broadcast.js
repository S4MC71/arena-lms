const { db, verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { isSharing, frame } = req.body;
  db.liveStreamState = {
    isSharing: !!isSharing,
    broadcasterName: user.name,
    frame: frame || (isSharing ? db.liveStreamState.frame : null),
    updatedAt: Date.now()
  };

  res.json({ success: true });
};
