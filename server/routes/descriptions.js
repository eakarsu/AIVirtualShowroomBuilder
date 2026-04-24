import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.name as product_name, p.image_url as product_image
      FROM ai_descriptions d LEFT JOIN products p ON d.product_id = p.id ORDER BY d.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT d.*, p.name as product_name, p.image_url as product_image
      FROM ai_descriptions d LEFT JOIN products p ON d.product_id = p.id WHERE d.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, headline, short_description, long_description, seo_tags, tone } = req.body;
    const result = await pool.query(
      'INSERT INTO ai_descriptions (product_id, headline, short_description, long_description, seo_tags, tone) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [product_id, headline, short_description, long_description, seo_tags, tone]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, headline, short_description, long_description, seo_tags, tone, status } = req.body;
    const result = await pool.query(
      'UPDATE ai_descriptions SET product_id=$1, headline=$2, short_description=$3, long_description=$4, seo_tags=$5, tone=$6, status=$7 WHERE id=$8 RETURNING *',
      [product_id, headline, short_description, long_description, seo_tags, tone, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ai_descriptions WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/generate', authenticateToken, async (req, res) => {
  try {
    const desc = await pool.query(`
      SELECT d.*, p.name as product_name, p.description as product_description, p.category, p.price
      FROM ai_descriptions d LEFT JOIN products p ON d.product_id = p.id WHERE d.id = $1
    `, [req.params.id]);
    if (desc.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = desc.rows[0];
    const aiResult = await callOpenRouter(
      'You are an expert e-commerce product copywriter. Generate compelling product descriptions with headline, short description, long description, and SEO tags. Use the specified tone. Format with markdown.',
      `Write product copy for: "${item.product_name}" (${item.category}, $${item.price}). Description: ${item.product_description}. Tone: ${item.tone || 'professional'}`
    );

    await pool.query('UPDATE ai_descriptions SET ai_output = $1 WHERE id = $2',
      [aiResult.result || aiResult.error, req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
