// Pump control and history - Member 3
const express = require('express');
const db = require('../db');
const { checkLogin } = require('./auth');

const router = express.Router();

// turn the pump ON or OFF by hand (FR-11, FR-12, FR-15)
router.post('/pump/:id/:state', checkLogin, async (req, res) => {
  try {
    const fieldId = parseInt(req.params.id, 10);
    if (isNaN(fieldId) || fieldId <= 0) {
      return res.status(400).json({ error: 'Invalid field ID.' });
    }

    const state = req.params.state ? req.params.state.toUpperCase() : '';
    if (state !== 'ON' && state !== 'OFF') {
      return res.status(400).json({ error: 'State must be ON or OFF.' });
    }

    // Verify field ownership
    const found = await db.query(
      'SELECT * FROM fields WHERE id = $1 AND user_id = $2',
      [fieldId, req.session.userId]
    );
    const field = found.rows[0];
    if (!field) {
      return res.status(404).json({ error: 'Field not found or access denied.' });
    }

    // Reject redundant state transitions (FR-12)
    if (field.pump_status === state) {
      return res.status(400).json({ error: `Pump is already ${state}.` });
    }

    await db.query('UPDATE fields SET pump_status = $1 WHERE id = $2', [state, field.id]);

    const last = await db.query(
      'SELECT moisture FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 1',
      [field.id]
    );
    const currentMoisture = last.rows.length ? Number(last.rows[0].moisture) : null;

    // Log manual pump action (FR-15)
    await db.query(
      "INSERT INTO logs (field_id, action, trigger_by, moisture) VALUES ($1, $2, 'MANUAL', $3)",
      [field.id, state === 'ON' ? 'START' : 'STOP', currentMoisture]
    );

    res.json({
      message: `Pump turned ${state} for ${field.name}.`,
      field_id: field.id,
      pump_status: state
    });
  } catch (err) {
    console.error('Error toggling pump:', err);
    res.status(500).json({ error: 'Internal server error while controlling pump.' });
  }
});

// automatic mode: check every field and switch the pump if needed (FR-13, FR-14, FR-15)
router.post('/auto', checkLogin, async (req, res) => {
  try {
    const fields = await db.query(
      'SELECT * FROM fields WHERE user_id = $1 ORDER BY id',
      [req.session.userId]
    );

    if (fields.rows.length === 0) {
      return res.json({
        results: ['No fields found. Add a field before running auto irrigation.'],
        total_checked: 0,
        actions_taken: 0
      });
    }

    const results = [];
    let actionsTaken = 0;

    for (const field of fields.rows) {
      const last = await db.query(
        'SELECT moisture FROM readings WHERE field_id = $1 ORDER BY id DESC LIMIT 1',
        [field.id]
      );

      // Alternate flow 2a: No reading exists -> skip with message
      if (!last.rows.length) {
        results.push(`${field.name}: no sensor reading yet.`);
        continue;
      }

      const moisture = Number(last.rows[0].moisture);
      if (isNaN(moisture)) {
        results.push(`${field.name}: invalid sensor reading skipped.`);
        continue;
      }

      let action = null;

      // Irrigation rule:
      // Moisture < threshold and pump OFF -> START pump (FR-13)
      // Moisture >= threshold and pump ON -> STOP pump (FR-14)
      if (moisture < field.threshold && field.pump_status === 'OFF') {
        action = 'START';
      } else if (moisture >= field.threshold && field.pump_status === 'ON') {
        action = 'STOP';
      }

      if (!action) {
        results.push(`${field.name}: moisture ${moisture}%, no change needed.`);
        continue;
      }

      const newPumpStatus = action === 'START' ? 'ON' : 'OFF';
      await db.query(
        'UPDATE fields SET pump_status = $1 WHERE id = $2',
        [newPumpStatus, field.id]
      );

      // Log automated pump action (FR-15)
      await db.query(
        "INSERT INTO logs (field_id, action, trigger_by, moisture) VALUES ($1, $2, 'AUTO', $3)",
        [field.id, action, moisture]
      );

      actionsTaken++;
      results.push(action === 'START'
        ? `${field.name}: moisture ${moisture}% is below threshold (${field.threshold}%), pump started.`
        : `${field.name}: moisture ${moisture}% reached threshold (${field.threshold}%), pump stopped.`
      );
    }

    res.json({
      results,
      total_checked: fields.rows.length,
      actions_taken: actionsTaken
    });
  } catch (err) {
    console.error('Error running auto irrigation:', err);
    res.status(500).json({ error: 'Internal server error during auto irrigation.' });
  }
});

// irrigation history of the logged-in user (FR-15, NFR-09)
router.get('/logs', checkLogin, async (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit, 10);
    const limit = !isNaN(rawLimit) && rawLimit > 0 && rawLimit <= 50 ? rawLimit : 15;

    const result = await db.query(`
      SELECT logs.*, fields.name AS field_name
      FROM logs
      JOIN fields ON fields.id = logs.field_id
      WHERE fields.user_id = $1
      ORDER BY logs.id DESC
      LIMIT $2
    `, [req.session.userId, limit]);

    res.json({ logs: result.rows });
  } catch (err) {
    console.error('Error fetching irrigation logs:', err);
    res.status(500).json({ error: 'Internal server error fetching logs.' });
  }
});

module.exports = router;
