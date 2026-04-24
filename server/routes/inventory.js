import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.name as product_name, p.image_url as product_image, p.sku
      FROM inventory i LEFT JOIN products p ON i.product_id = p.id ORDER BY i.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, p.name as product_name, p.image_url as product_image, p.sku
      FROM inventory i LEFT JOIN products p ON i.product_id = p.id WHERE i.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, warehouse, quantity, reserved, reorder_level, reorder_quantity } = req.body;
    const result = await pool.query(
      'INSERT INTO inventory (product_id, warehouse, quantity, reserved, reorder_level, reorder_quantity, last_restocked) VALUES ($1,$2,$3,$4,$5,$6,NOW()) RETURNING *',
      [product_id, warehouse, quantity, reserved || 0, reorder_level || 10, reorder_quantity || 50]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, warehouse, quantity, reserved, reorder_level, reorder_quantity, status } = req.body;
    const result = await pool.query(
      'UPDATE inventory SET product_id=$1, warehouse=$2, quantity=$3, reserved=$4, reorder_level=$5, reorder_quantity=$6, status=$7 WHERE id=$8 RETURNING *',
      [product_id, warehouse, quantity, reserved, reorder_level, reorder_quantity, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM inventory WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
