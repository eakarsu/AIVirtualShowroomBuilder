import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as product_name, p.image_url as product_image
      FROM ar_tryons t LEFT JOIN products p ON t.product_id = p.id ORDER BY t.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT t.*, p.name as product_name, p.image_url as product_image
      FROM ar_tryons t LEFT JOIN products p ON t.product_id = p.id WHERE t.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, ar_settings } = req.body;
    const result = await pool.query(
      'INSERT INTO ar_tryons (product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, ar_settings) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, JSON.stringify(ar_settings)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, ar_settings, status } = req.body;
    const result = await pool.query(
      'UPDATE ar_tryons SET product_id=$1, customer_name=$2, fit_accuracy=$3, body_landmarks=$4, size_recommendation=$5, style_score=$6, ar_settings=$7, status=$8 WHERE id=$9 RETURNING *',
      [product_id, customer_name, fit_accuracy, body_landmarks, size_recommendation, style_score, JSON.stringify(ar_settings), status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM ar_tryons WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/analyze', authenticateToken, async (req, res) => {
  try {
    const tryon = await pool.query(`
      SELECT t.*, p.name as product_name, p.description as product_description, p.category
      FROM ar_tryons t LEFT JOIN products p ON t.product_id = p.id WHERE t.id = $1
    `, [req.params.id]);
    if (tryon.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = tryon.rows[0];
    const aiResult = await callOpenRouter(
      'You are an AR try-on and fashion fitting expert. Analyze the virtual try-on session and provide detailed fit recommendations, style suggestions, and AR optimization tips. Format with markdown.',
      `Analyze AR try-on for ${item.customer_name} trying "${item.product_name}" (${item.category}). Fit accuracy: ${item.fit_accuracy}%, Body landmarks: ${item.body_landmarks}, Size: ${item.size_recommendation}, Style score: ${item.style_score}/10`
    );

    await pool.query('UPDATE ar_tryons SET ai_analysis = $1 WHERE id = $2',
      [aiResult.result || aiResult.error, req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
