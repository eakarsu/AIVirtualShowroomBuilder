import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_themes ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_themes WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, primary_color, secondary_color, accent_color, font_family, layout_style, status } = req.body;
    const result = await pool.query(
      'INSERT INTO store_themes (name, primary_color, secondary_color, accent_color, font_family, layout_style, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, primary_color, secondary_color, accent_color, font_family, layout_style, status || 'active']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, primary_color, secondary_color, accent_color, font_family, layout_style, status } = req.body;
    const result = await pool.query(
      'UPDATE store_themes SET name=$1, primary_color=$2, secondary_color=$3, accent_color=$4, font_family=$5, layout_style=$6, status=$7 WHERE id=$8 RETURNING *',
      [name, primary_color, secondary_color, accent_color, font_family, layout_style, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM store_themes WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
