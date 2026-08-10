const { db, createToken, setCors } = require('../_db');

module.exports = async (req, res) => {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  const user = db.users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password. Please try again.' });

  const token = createToken(user);
  const { password: _, ...safeUser } = user;
  res.json({ success: true, token, user: safeUser });
};
