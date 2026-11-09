const express = require('express');
const { pool } = require('../db');
const router = express.Router();

router.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT id, minus, plus, cylinder, created_at FROM simulations ORDER BY created_at DESC LIMIT 50');
    res.status(200).json(result.rows);
  } catch (error) { next(error); }
});

router.post('/', async (req, res, next) => {
  const { minus, plus, cylinder } = req.body || {};
  const validNumber = (n) => typeof n === 'number' && Number.isFinite(n);
  if (![minus, plus, cylinder].every(validNumber)) return res.status(400).json({ error: 'minus, plus, and cylinder must be numbers.' });
  if (minus < -10 || minus > 0 || plus < 0 || plus > 10 || cylinder < -6 || cylinder > 0) {
    return res.status(400).json({ error: 'Values must be minus [-10, 0], plus [0, 10], and cylinder [-6, 0].' });
  }
  if (minus < 0 && plus > 0) return res.status(400).json({ error: 'Minus and plus values cannot both be active.' });
  try {
    const result = await pool.query('INSERT INTO simulations (minus, plus, cylinder) VALUES ($1, $2, $3) RETURNING id, minus, plus, cylinder, created_at', [minus, plus, cylinder]);
    res.status(201).json(result.rows[0]);
  } catch (error) { next(error); }
});

module.exports = router;
