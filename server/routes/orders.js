import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o LEFT JOIN customers c ON o.customer_id = c.id ORDER BY o.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o LEFT JOIN customers c ON o.customer_id = c.id WHERE o.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer_id, total_amount, status, shipping_address, payment_method } = req.body;
    const result = await pool.query(
      'INSERT INTO orders (customer_id, total_amount, status, shipping_address, payment_method) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [customer_id, total_amount, status || 'pending', shipping_address, payment_method]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { customer_id, total_amount, status, shipping_address, payment_method } = req.body;
    const result = await pool.query(
      'UPDATE orders SET customer_id=$1, total_amount=$2, status=$3, shipping_address=$4, payment_method=$5, updated_at=NOW() WHERE id=$6 RETURNING *',
      [customer_id, total_amount, status, shipping_address, payment_method, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM orders WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
