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
      pool.query(`SELECT m.*, p.name as product_name, p.image_url as product_image
        FROM product_3d_models m LEFT JOIN products p ON m.product_id = p.id
        ORDER BY m.id DESC LIMIT $1 OFFSET $2`, [limit, offset]),
      pool.query('SELECT COUNT(*) FROM product_3d_models'),
    ]);
    const total = parseInt(countRes.rows[0].count);
    res.json({ data: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT m.*, p.name as product_name, p.image_url as product_image
      FROM product_3d_models m LEFT JOIN products p ON m.product_id = p.id WHERE m.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status } = req.body;
    const result = await pool.query(
      'INSERT INTO product_3d_models (product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status } = req.body;
    const result = await pool.query(
      'UPDATE product_3d_models SET product_id=$1, model_url=$2, polygon_count=$3, file_format=$4, texture_maps=$5, dimensions=$6, status=$7 WHERE id=$8 RETURNING *',
      [product_id, model_url, polygon_count, file_format, texture_maps, dimensions, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM product_3d_models WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/generate', authenticateToken, async (req, res) => {
  try {
    const model = await pool.query(`
      SELECT m.*, p.name as product_name, p.description as product_description
      FROM product_3d_models m LEFT JOIN products p ON m.product_id = p.id WHERE m.id = $1
    `, [req.params.id]);
    if (model.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = model.rows[0];
    const aiResult = await callOpenRouter(
      'You are a 3D modeling expert. Analyze the product and provide detailed 3D model generation specifications including geometry, textures, materials, and optimization recommendations. Format your response with markdown headers and bullet points.',
      `Generate 3D model specs for: ${item.product_name}. Description: ${item.product_description}. Current format: ${item.file_format}, Polygons: ${item.polygon_count}, Dimensions: ${item.dimensions}`
    );

    await pool.query('UPDATE product_3d_models SET ai_analysis = $1, status = $2 WHERE id = $3',
      [aiResult.result || aiResult.error, 'completed', req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
