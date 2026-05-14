import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows, countRes] = await Promise.all([
      pool.query('SELECT * FROM store_layouts ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM store_layouts'),
    ]);
    const total = parseInt(countRes.rows[0].count);
    res.json({ data: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM store_layouts WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, layout_type, zone_count, total_area, color_scheme, description, status } = req.body;
    const result = await pool.query(
      'INSERT INTO store_layouts (name, layout_type, zone_count, total_area, color_scheme, description, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [name, layout_type, zone_count, total_area, JSON.stringify(color_scheme), description, status || 'draft']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, layout_type, zone_count, total_area, color_scheme, description, status } = req.body;
    const result = await pool.query(
      'UPDATE store_layouts SET name=$1, layout_type=$2, zone_count=$3, total_area=$4, color_scheme=$5, description=$6, status=$7, updated_at=NOW() WHERE id=$8 RETURNING *',
      [name, layout_type, zone_count, total_area, JSON.stringify(color_scheme), description, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM store_layouts WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/generate', authenticateToken, async (req, res) => {
  try {
    const layout = await pool.query('SELECT * FROM store_layouts WHERE id = $1', [req.params.id]);
    if (layout.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = layout.rows[0];
    const aiResult = await callOpenRouter(
      'You are a virtual store layout designer expert. Create detailed store layout suggestions including zone placement, traffic flow optimization, product display strategies, and visual merchandising tips. Format with markdown.',
      `Design a virtual store layout for: "${item.name}". Type: ${item.layout_type}, Zones: ${item.zone_count}, Area: ${item.total_area}. Description: ${item.description}`
    );

    await pool.query('UPDATE store_layouts SET ai_suggestions = $1 WHERE id = $2',
      [aiResult.result || aiResult.error, req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
