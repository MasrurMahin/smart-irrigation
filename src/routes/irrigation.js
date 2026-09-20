// Pump control and history - Member 3
const express = require('express');
const db = require('../db');
const { checkLogin } = require('./auth');

const router = express.Router();

// turn the pump ON or OFF by hand
router.post('/pump/:id/:state', checkLogin, async (req, res) => {
  const state = req.params.state.toUpperCase();          // ON or OFF
  if (state !== 'ON' && state !== 'OFF') {
    return res.status(400).json({ error: 'State must be ON or OFF.' });
  }

  const found = await db.query(
    'SELECT * FROM fields WHERE id = $1 AND user_id = $2', [req.params.id, req.session.userId]
  );
  const field = found.rows[0];
  if (!field) return res.status(404).json({ error: 'Field not found.' });

  if (field.pump_status === state) {
    return res.status(400).json({ error: `Pump is already ${state}.` });
  }

  await db.query('UPDATE fields SET pump_status = $1 WHERE id = $2', [state, field.id]);

  const last = await db.query(
    'SELECT moisture FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 1', [field.id]
  );
  await db.query(
    "INSERT INTO logs (field_id, action, trigger_by, moisture) VALUES ($1, $2, 'MANUAL', $3)",
    [field.id, state === 'ON' ? 'START' : 'STOP', last.rows[0] ? last.rows[0].moisture : null]
  );

  res.json({ message: `Pump turned ${state} for ${field.name}.` });
});

// automatic mode: check every field and switch the pump if needed
router.post('/auto', checkLogin, async (req, res) => {
  const fields = await db.query(
    'SELECT * FROM fields WHERE user_id = $1 ORDER BY id', [req.session.userId]
  );
  const results = [];

  for (const field of fields.rows) {
    const last = await db.query(
      'SELECT moisture FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 1', [field.id]
    );

    if (!last.rows.length) {
      results.push(`${field.name}: no sensor reading yet.`);
      continue;
    }

    const moisture = Number(last.rows[0].moisture);
    let action = null;

    if (moisture < field.threshold && field.pump_status === 'OFF') action = 'START';
    else if (moisture >= field.threshold && field.pump_status === 'ON') action = 'STOP';

    if (!action) {
      results.push(`${field.name}: moisture ${moisture}%, no change needed.`);
      continue;
    }

    await db.query(
      'UPDATE fields SET pump_status = $1 WHERE id = $2',
      [action === 'START' ? 'ON' : 'OFF', field.id]
    );
    await db.query(
      "INSERT INTO logs (field_id, action, trigger_by, moisture) VALUES ($1, $2, 'AUTO', $3)",
      [field.id, action, moisture]
    );

    results.push(action === 'START'
      ? `${field.name}: moisture ${moisture}% is below ${field.threshold}%, pump started.`
      : `${field.name}: moisture ${moisture}% is enough, pump stopped.`);
  }

  res.json({ results });
});

// irrigation history of the logged-in user
router.get('/logs', checkLogin, async (req, res) => {
  const result = await db.query(`
    SELECT logs.*, fields.name AS field_name
    FROM logs JOIN fields ON fields.id = logs.field_id
    WHERE fields.user_id = $1
    ORDER BY logs.id DESC LIMIT 15
  `, [req.session.userId]);

  res.json({ logs: result.rows });
});

module.exports = router;
