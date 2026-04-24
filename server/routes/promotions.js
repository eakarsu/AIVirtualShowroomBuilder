import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotions ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM promotions WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit } = req.body;
    const result = await pool.query(
      'INSERT INTO promotions (name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit, status } = req.body;
    const result = await pool.query(
      'UPDATE promotions SET name=$1, code=$2, discount_type=$3, discount_value=$4, min_purchase=$5, start_date=$6, end_date=$7, usage_limit=$8, status=$9 WHERE id=$10 RETURNING *',
      [name, code, discount_type, discount_value, min_purchase, start_date, end_date, usage_limit, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM promotions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
