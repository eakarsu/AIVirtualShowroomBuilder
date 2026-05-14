import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  return null;
}

router.get('/', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows, countRes] = await Promise.all([
      pool.query('SELECT * FROM customer_analytics ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]),
      pool.query('SELECT COUNT(*) FROM customer_analytics'),
    ]);
    const total = parseInt(countRes.rows[0].count);
    res.json({ data: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM customer_analytics WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { metric_name, metric_value, metric_type, period, segment, trend, details } = req.body;
    const result = await pool.query(
      'INSERT INTO customer_analytics (metric_name, metric_value, metric_type, period, segment, trend, details) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *',
      [metric_name, metric_value, metric_type, period, segment, trend, JSON.stringify(details)]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { metric_name, metric_value, metric_type, period, segment, trend, details } = req.body;
    const result = await pool.query(
      'UPDATE customer_analytics SET metric_name=$1, metric_value=$2, metric_type=$3, period=$4, segment=$5, trend=$6, details=$7 WHERE id=$8 RETURNING *',
      [metric_name, metric_value, metric_type, period, segment, trend, JSON.stringify(details), req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json(result.rows[0]);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM customer_analytics WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted', item: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/analytics/analyze — AI analysis of analytics data
router.post('/analyze', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { metric_ids, timeframe } = req.body;
    let data;
    if (metric_ids && metric_ids.length) {
      const result = await pool.query('SELECT * FROM customer_analytics WHERE id = ANY($1)', [metric_ids]);
      data = result.rows;
    } else {
      const result = await pool.query('SELECT * FROM customer_analytics ORDER BY id DESC LIMIT 50');
      data = result.rows;
    }

    const aiResult = await callOpenRouter(
      'You are an expert analytics strategist for virtual showrooms. Analyze the provided metrics and give actionable insights to improve conversions, engagement, and revenue. Return JSON with keys: insights, topOpportunities, riskAreas, recommendations, overallHealthScore.',
      `Analyze these showroom analytics metrics (timeframe: ${timeframe || 'recent'}): ${JSON.stringify(data)}`
    );

    const parsed = parseAIJson(aiResult.result || '');
    await pool.query(
      'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
      [req.user.id, '/api/analytics/analyze', JSON.stringify({ metric_ids, timeframe }), JSON.stringify(parsed || aiResult.result)]
    ).catch(() => {});

    res.json({ success: aiResult.success, analysis: parsed || aiResult.result, error: aiResult.error });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
