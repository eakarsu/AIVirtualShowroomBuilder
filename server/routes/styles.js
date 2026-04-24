import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM style_recommendations ORDER BY id');
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM style_recommendations WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { customer_name, style_profile, confidence_score, recommended_products, trending_combos } = req.body;
    const result = await pool.query(
      'INSERT INTO style_recommendations (customer_name, style_profile, confidence_score, recommended_products, trending_combos) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [customer_name, style_profile, confidence_score, recommended_products, trending_combos]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { customer_name, style_profile, confidence_score, recommended_products, trending_combos, status } = req.body;
    const result = await pool.query(
      'UPDATE style_recommendations SET customer_name=$1, style_profile=$2, confidence_score=$3, recommended_products=$4, trending_combos=$5, status=$6 WHERE id=$7 RETURNING *',
      [customer_name, style_profile, confidence_score, recommended_products, trending_combos, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM style_recommendations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/generate', authenticateToken, async (req, res) => {
  try {
    const style = await pool.query('SELECT * FROM style_recommendations WHERE id = $1', [req.params.id]);
    if (style.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = style.rows[0];
    const aiResult = await callOpenRouter(
      'You are a fashion style recommendation expert and personal stylist. Provide detailed style analysis, product pairings, trend forecasts, and personalized outfit suggestions. Format with markdown.',
      `Generate style recommendations for ${item.customer_name}. Profile: ${item.style_profile}. Current recommendations: ${item.recommended_products}. Trending: ${item.trending_combos}`
    );

    await pool.query('UPDATE style_recommendations SET ai_output = $1 WHERE id = $2',
      [aiResult.result || aiResult.error, req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
