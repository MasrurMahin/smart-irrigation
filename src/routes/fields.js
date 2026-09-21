// Fields and sensor readings - Member 2
const express = require('express');
const db = require('../db');
const { checkLogin } = require('./auth');

const router = express.Router();

// list all fields of the logged-in user with their latest reading
router.get('/fields', checkLogin, async (req, res) => {
  const result = await db.query(
    'SELECT * FROM fields WHERE user_id = $1 ORDER BY id', [req.session.userId]
  );
  const fields = result.rows;

  for (const field of fields) {
    const reading = await db.query(
      'SELECT * FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 1', [field.id]
    );
    field.reading = reading.rows[0] || null;
    field.status = !field.reading
      ? 'no data'
      : (Number(field.reading.moisture) < field.threshold ? 'dry' : 'ok');
  }

  res.json({ fields });
});

// add a new field
router.post('/fields', checkLogin, async (req, res) => {
  const { name, crop, area, threshold } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Field name is required.' });
  }
  if (!crop || typeof crop !== 'string' || !crop.trim()) {
    return res.status(400).json({ error: 'Crop type is required.' });
  }

  const parsedArea = area !== undefined && area !== '' ? parseFloat(area) : 1.0;
  if (isNaN(parsedArea) || parsedArea <= 0 || parsedArea > 999.99) {
    return res.status(400).json({ error: 'Area must be a positive number up to 999.99 acres/hectares.' });
  }

  const parsedThreshold = threshold !== undefined && threshold !== '' ? parseInt(threshold, 10) : 35;
  if (isNaN(parsedThreshold) || parsedThreshold < 1 || parsedThreshold > 100) {
    return res.status(400).json({ error: 'Moisture threshold must be between 1% and 100%.' });
  }

  await db.query(
    'INSERT INTO fields (user_id, name, crop, area, threshold) VALUES ($1, $2, $3, $4, $5)',
    [req.session.userId, name.trim(), crop.trim(), parsedArea, parsedThreshold]
  );
  res.json({ message: 'Field added.' });
});

// delete a field (verifies user ownership)
router.delete('/fields/:id', checkLogin, async (req, res) => {
  const result = await db.query(
    'DELETE FROM fields WHERE id = $1 AND user_id = $2',
    [req.params.id, req.session.userId]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: 'Field not found or access denied.' });
  }
  res.json({ message: 'Field deleted.' });
});

// save one sensor reading (sent by hardware, or generated below)
router.post('/fields/:id/reading', checkLogin, async (req, res) => {
  const { moisture, temperature, humidity } = req.body;
  if (moisture === undefined || moisture < 0 || moisture > 100) {
    return res.status(400).json({ error: 'Moisture must be between 0 and 100.' });
  }

  await db.query(
    'INSERT INTO readings (field_id, moisture, temperature, humidity) VALUES ($1, $2, $3, $4)',
    [req.params.id, moisture, temperature || null, humidity || null]
  );
  res.json({ message: 'Reading saved.' });
});

// last 10 readings of one field
router.get('/fields/:id/readings', checkLogin, async (req, res) => {
  const result = await db.query(
    'SELECT * FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 10', [req.params.id]
  );
  res.json({ readings: result.rows });
});

// sensor simulator: one random reading for every field (no hardware yet)
router.post('/simulate', checkLogin, async (req, res) => {
  const result = await db.query('SELECT id FROM fields WHERE user_id = $1', [req.session.userId]);

  for (const field of result.rows) {
    const moisture = (Math.random() * 60 + 15).toFixed(1);    // 15% - 75%
    const temperature = (Math.random() * 15 + 22).toFixed(1);
    const humidity = (Math.random() * 40 + 50).toFixed(1);
    await db.query(
      'INSERT INTO readings (field_id, moisture, temperature, humidity) VALUES ($1, $2, $3, $4)',
      [field.id, moisture, temperature, humidity]
    );
  }

  res.json({ message: `${result.rows.length} new sensor readings taken.` });
});

module.exports = router;
