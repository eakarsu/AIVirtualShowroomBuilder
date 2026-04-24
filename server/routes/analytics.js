import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_analytics ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { metric_name, metric_value, metric_type, period, segment, trend, details } = req.body;
    const result = await pool.query(
      'INSERT INTO customer_analytics (metric_name, metric_value, metric_type, period, segment, trend, details) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [metric_name, metric_value, metric_type, period, segment, trend, JSON.stringify(details)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { metric_name, metric_value, metric_type, period, segment, trend, details } = req.body;
    const result = await pool.query(
      'UPDATE customer_analytics SET metric_name=$1, metric_value=$2, metric_type=$3, period=$4, segment=$5, trend=$6, details=$7 WHERE id=$8 RETURNING *',
      [metric_name, metric_value, metric_type, period, segment, trend, JSON.stringify(details), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customer_analytics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
