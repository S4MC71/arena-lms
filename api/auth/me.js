const { verifyToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const user = verifyToken(req.headers.authorization);
  if (!user) return res.status(401).json({ error: 'Unauthorized. Please login.' });

  const { password: _, ...safeUser } = user;
  res.json({ success: true, user: safeUser });
};
