import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, p.name as product_name, p.image_url as product_image
      FROM price_optimizations po LEFT JOIN products p ON po.product_id = p.id ORDER BY po.id
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT po.*, p.name as product_name, p.image_url as product_image
      FROM price_optimizations po LEFT JOIN products p ON po.product_id = p.id WHERE po.id = $1
    `, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact } = req.body;
    const result = await pool.query(
      'INSERT INTO price_optimizations (product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact, status } = req.body;
    const result = await pool.query(
      'UPDATE price_optimizations SET product_id=$1, current_price=$2, recommended_price=$3, market_position=$4, elasticity_score=$5, revenue_impact=$6, status=$7 WHERE id=$8 RETURNING *',
      [product_id, current_price, recommended_price, market_position, elasticity_score, revenue_impact, status, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM price_optimizations WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/:id/optimize', authenticateToken, async (req, res) => {
  try {
    const pricing = await pool.query(`
      SELECT po.*, p.name as product_name, p.category
      FROM price_optimizations po LEFT JOIN products p ON po.product_id = p.id WHERE po.id = $1
    `, [req.params.id]);
    if (pricing.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const item = pricing.rows[0];
    const aiResult = await callOpenRouter(
      'You are a pricing strategy and revenue optimization expert. Analyze the product pricing data and provide detailed pricing recommendations including competitive analysis, demand elasticity insights, and revenue projections. Format with markdown tables and sections.',
      `Optimize pricing for "${item.product_name}" (${item.category}). Current: $${item.current_price}, Recommended: $${item.recommended_price}, Market: ${item.market_position}, Elasticity: ${item.elasticity_score}, Impact: ${item.revenue_impact}`
    );

    await pool.query('UPDATE price_optimizations SET ai_output = $1 WHERE id = $2',
      [aiResult.result || aiResult.error, req.params.id]);

    res.json(aiResult);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
