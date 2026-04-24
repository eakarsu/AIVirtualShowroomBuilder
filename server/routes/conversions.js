import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name as product_name
      FROM conversion_events c LEFT JOIN products p ON c.product_id = p.id ORDER BY c.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, p.name as product_name
      FROM conversion_events c LEFT JOIN products p ON c.product_id = p.id WHERE c.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { event_type, source, product_id, customer_email, revenue, funnel_stage, device, details } = req.body;
    const result = await pool.query(
      'INSERT INTO conversion_events (event_type, source, product_id, customer_email, revenue, funnel_stage, device, details) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [event_type, source, product_id, customer_email, revenue, funnel_stage, device, JSON.stringify(details)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { event_type, source, product_id, customer_email, revenue, funnel_stage, device, details } = req.body;
    const result = await pool.query(
      'UPDATE conversion_events SET event_type=$1, source=$2, product_id=$3, customer_email=$4, revenue=$5, funnel_stage=$6, device=$7, details=$8 WHERE id=$9 RETURNING *',
      [event_type, source, product_id, customer_email, revenue, funnel_stage, device, JSON.stringify(details), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM conversion_events WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
