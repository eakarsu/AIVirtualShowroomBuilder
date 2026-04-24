import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as product_name, p.image_url as product_image
      FROM reviews r LEFT JOIN products p ON r.product_id = p.id ORDER BY r.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT r.*, p.name as product_name, p.image_url as product_image
      FROM reviews r LEFT JOIN products p ON r.product_id = p.id WHERE r.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, customer_name, rating, title, body, verified_purchase } = req.body;
    const result = await pool.query(
      'INSERT INTO reviews (product_id, customer_name, rating, title, body, verified_purchase) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [product_id, customer_name, rating, title, body, verified_purchase || false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, customer_name, rating, title, body, verified_purchase, status } = req.body;
    const result = await pool.query(
      'UPDATE reviews SET product_id=$1, customer_name=$2, rating=$3, title=$4, body=$5, verified_purchase=$6, status=$7 WHERE id=$8 RETURNING *',
      [product_id, customer_name, rating, title, body, verified_purchase, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM reviews WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
