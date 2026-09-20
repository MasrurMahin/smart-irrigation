// Register, login, logout - Member 1
const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db');

const router = express.Router();

// middleware used by the other route files
function checkLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ error: 'Please log in first.' });
  next();
}

router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

  const exists = await db.query('SELECT id FROM users WHERE email = $1', [email]);
  if (exists.rows.length) return res.status(400).json({ error: 'This email is already registered.' });

  const hash = bcrypt.hashSync(password, 10);
  const result = await db.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id',
    [name, email, hash]
  );

  req.session.userId = result.rows[0].id;
  res.json({ message: 'Account created.' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ error: 'Wrong email or password.' });
  }

  req.session.userId = user.id;
  res.json({ message: 'Logged in.' });
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => res.json({ message: 'Logged out.' }));
});

router.get('/me', checkLogin, async (req, res) => {
  const result = await db.query('SELECT id, name, email FROM users WHERE id = $1', [req.session.userId]);
  res.json({ user: result.rows[0] });
});

module.exports = router;
module.exports.checkLogin = checkLogin;
