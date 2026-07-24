import { Router } from 'express';
import pool from '../db.js';
import { authenticateToken } from '../middleware/auth.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';
import { callOpenRouter } from '../services/openrouter.js';

const router = Router();

const MODEL = 'anthropic/claude-3-5-sonnet-20241022';

function parseAIJson(text) {
  try { return JSON.parse(text); } catch (e) {}
  const stripped = text.replace(/```(?:json)?\n?/g, '').replace(/```/g, '').trim();
  try { return JSON.parse(stripped); } catch (e) {}
  const start = text.indexOf('{'); const end = text.lastIndexOf('}');
  if (start !== -1 && end !== -1) { try { return JSON.parse(text.slice(start, end + 1)); } catch (e) {} }
  return null;
}

async function persistAIResult(userId, endpoint, inputData, result) {
  await pool.query(
    'INSERT INTO ai_results (user_id, endpoint, input_data, result) VALUES ($1, $2, $3, $4)',
    [userId, endpoint, JSON.stringify(inputData), JSON.stringify(result)]
  );
}

// GET /api/ai/results — paginated AI result history
router.get('/results', authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;
    const [rows, countRes] = await Promise.all([
      pool.query('SELECT * FROM ai_results WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [req.user.id, limit, offset]),
      pool.query('SELECT COUNT(*) FROM ai_results WHERE user_id = $1', [req.user.id]),
    ]);
    const total = parseInt(countRes.rows[0].count);
    res.json({ data: rows.rows, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/room-layout-optimizer
// Given room dimensions and product list, generate optimal arrangement
router.post('/room-layout-optimizer', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { width, height, depth, products, style, targetAudience } = req.body;
    if (!width || !height || !products) {
      return res.status(400).json({ error: 'width, height, and products are required' });
    }

    const systemPrompt = `You are an expert virtual showroom architect and retail space designer.
    Analyze room dimensions and product inventory to generate optimal spatial arrangements that maximize
    customer engagement and conversion. Return ONLY valid JSON.`;

    const userPrompt = `Generate an optimal room layout for a virtual showroom with these specs:
Room Dimensions: ${width}m W x ${height}m H x ${(depth || width)}m D
Style: ${style || 'modern'}
Target Audience: ${targetAudience || 'general consumers'}
Products to place: ${JSON.stringify(products)}

Return a JSON object with:
{
  "zones": [{"name": string, "position": {"x": number, "y": number, "z": number}, "dimensions": {"w": number, "h": number, "d": number}, "purpose": string, "products": [string], "priority": "high|medium|low"}],
  "trafficFlow": {"entry": string, "primaryPath": string, "hotspots": [string], "exitStrategy": string},
  "lightingZones": [{"zone": string, "type": string, "intensity": string, "colorTemp": string}],
  "conversionOptimizations": [string],
  "accessibilityScore": number,
  "estimatedEngagementScore": number,
  "layoutName": string,
  "rationale": string
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });

    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/room-layout-optimizer', { width, height, depth, products, style }, parsed || aiResult.result);

    res.json({ success: true, layout: parsed || aiResult.result, raw: aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/product-description-enhancer
// Enrich product details with AI-generated marketing copy
router.post('/product-description-enhancer', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { productId, name, description, category, price, features, targetMarket } = req.body;
    if (!name) return res.status(400).json({ error: 'Product name is required' });

    let dbProduct = null;
    if (productId) {
      const result = await pool.query('SELECT * FROM products WHERE id = $1', [productId]);
      dbProduct = result.rows[0] || null;
    }

    const productData = dbProduct || { name, description, category, price, features };

    const systemPrompt = `You are a world-class e-commerce copywriter and brand strategist specializing in
    luxury and premium product positioning. Create compelling, conversion-optimized product content. Return ONLY valid JSON.`;

    const userPrompt = `Create enhanced marketing copy for this product:
Name: ${productData.name}
Category: ${productData.category || category || 'general'}
Price: $${productData.price || price || 'N/A'}
Current Description: ${productData.description || description || 'None'}
Key Features: ${JSON.stringify(productData.features || features || [])}
Target Market: ${targetMarket || 'premium consumers'}

Return JSON:
{
  "headline": string,
  "tagline": string,
  "shortDescription": string (50-80 words),
  "longDescription": string (150-200 words),
  "bulletPoints": [string] (5-7 benefit-focused bullets),
  "seoTitle": string,
  "seoMetaDescription": string (155 chars max),
  "seoKeywords": [string],
  "emotionalTriggers": [string],
  "callToAction": string,
  "socialProofSuggestion": string,
  "tone": string,
  "readabilityScore": number
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });

    const parsed = parseAIJson(aiResult.result);

    if (productId && parsed) {
      await pool.query(
        'UPDATE products SET ai_description = $1 WHERE id = $2',
        [JSON.stringify(parsed), productId]
      ).catch(() => {});
    }

    await persistAIResult(req.user.id, '/api/ai/product-description-enhancer', { productId, name }, parsed || aiResult.result);

    res.json({ success: true, enhanced: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/lighting-mood-generator
// Suggest lighting presets based on product category
router.post('/lighting-mood-generator', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { productCategory, brandPersonality, targetEmotion, roomDimensions, showroomType } = req.body;
    if (!productCategory) return res.status(400).json({ error: 'productCategory is required' });

    const systemPrompt = `You are a master lighting designer specializing in retail and virtual showroom environments.
    You understand how lighting affects consumer psychology, product perception, and purchase decisions. Return ONLY valid JSON.`;

    const userPrompt = `Generate comprehensive lighting presets for a virtual showroom:
Product Category: ${productCategory}
Brand Personality: ${brandPersonality || 'modern premium'}
Target Emotional Response: ${targetEmotion || 'desire and trust'}
Room Type: ${showroomType || 'virtual retail'}
Dimensions: ${JSON.stringify(roomDimensions || { width: 10, height: 3, depth: 10 })}

Return JSON:
{
  "presets": [
    {
      "name": string,
      "mood": string,
      "ambientLight": {"color": string, "intensity": number, "colorTemp": number},
      "accentLights": [{"position": string, "type": string, "color": string, "intensity": number, "angle": number}],
      "shadowIntensity": string,
      "highlights": string,
      "bestFor": [string],
      "psychologicalEffect": string,
      "conversionImpact": string
    }
  ],
  "recommendedPreset": string,
  "colorPalette": {"primary": string, "secondary": string, "accent": string, "background": string},
  "timeOfDayVariations": {"morning": string, "afternoon": string, "evening": string},
  "specialEffects": [string],
  "technicalSpecs": {"renderEngine": string, "globalIllumination": boolean, "hdrSupport": boolean}
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });

    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/lighting-mood-generator', { productCategory, brandPersonality, targetEmotion }, parsed || aiResult.result);

    res.json({ success: true, lighting: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/visitor-behavior-analyzer
// Analyze visit patterns from analytics data and suggest improvements
router.post('/visitor-behavior-analyzer', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { analyticsIds, timeRange, customData } = req.body;

    let analyticsData = customData || [];

    if (analyticsIds && analyticsIds.length > 0) {
      const result = await pool.query(
        'SELECT * FROM customer_analytics WHERE id = ANY($1)',
        [analyticsIds]
      );
      analyticsData = [...analyticsData, ...result.rows];
    }

    if (analyticsData.length === 0) {
      const result = await pool.query('SELECT * FROM customer_analytics ORDER BY id DESC LIMIT 50');
      analyticsData = result.rows;
    }

    const systemPrompt = `You are a behavioral analytics expert specializing in virtual retail environments.
    You analyze visitor interaction patterns to uncover conversion opportunities and UX improvements. Return ONLY valid JSON.`;

    const userPrompt = `Analyze this virtual showroom visitor behavior data and provide actionable insights:
Time Range: ${timeRange || 'last 30 days'}
Analytics Data: ${JSON.stringify(analyticsData.slice(0, 30))}

Return JSON:
{
  "summary": {"totalVisitors": number, "avgSessionDuration": string, "conversionRate": string, "bounceRate": string},
  "behaviorPatterns": [{"pattern": string, "frequency": string, "impact": string, "recommendation": string}],
  "hotspots": [{"zone": string, "engagementLevel": string, "insight": string}],
  "dropoffPoints": [{"location": string, "severity": string, "cause": string, "fix": string}],
  "topPerformingProducts": [string],
  "underperformingAreas": [string],
  "improvements": [{"priority": "high|medium|low", "area": string, "action": string, "expectedImpact": string}],
  "segmentInsights": [{"segment": string, "behavior": string, "recommendation": string}],
  "overallScore": number,
  "executiveSummary": string
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });

    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/visitor-behavior-analyzer', { analyticsIds, timeRange }, parsed || aiResult.result);

    res.json({ success: true, analysis: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/showroom-comparison
// Compare multiple layout options with AI-generated scores
router.post('/showroom-comparison', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { layoutIds, criteria, context } = req.body;

    let layouts = [];
    if (layoutIds && layoutIds.length > 0) {
      const result = await pool.query(
        'SELECT * FROM store_layouts WHERE id = ANY($1)',
        [layoutIds]
      );
      layouts = result.rows;
    }

    if (layouts.length === 0) {
      return res.status(400).json({ error: 'No layouts found. Provide valid layoutIds.' });
    }

    const systemPrompt = `You are a retail strategy consultant specializing in virtual showroom optimization.
    You evaluate and compare showroom layouts using data-driven metrics and industry best practices. Return ONLY valid JSON.`;

    const userPrompt = `Compare these virtual showroom layouts and provide a comprehensive analysis:
Evaluation Criteria: ${JSON.stringify(criteria || ['conversion', 'engagement', 'navigation', 'aesthetics', 'accessibility'])}
Business Context: ${context || 'premium retail showroom'}
Layouts to Compare:
${JSON.stringify(layouts.map(l => ({ id: l.id, name: l.name, type: l.layout_type, zones: l.zone_count, area: l.total_area, description: l.description, colorScheme: l.color_scheme })))}

Return JSON:
{
  "winner": {"layoutId": number, "layoutName": string, "reason": string},
  "rankings": [{"rank": number, "layoutId": number, "layoutName": string, "overallScore": number}],
  "comparison": [
    {
      "layoutId": number,
      "layoutName": string,
      "scores": {"conversion": number, "engagement": number, "navigation": number, "aesthetics": number, "accessibility": number},
      "strengths": [string],
      "weaknesses": [string],
      "bestFor": string,
      "recommendation": string
    }
  ],
  "headToHead": [{"criteria": string, "winner": string, "margin": string, "analysis": string}],
  "hybridSuggestion": string,
  "implementationOrder": [string],
  "roiProjection": {"bestLayout": string, "estimatedConversionLift": string, "paybackPeriod": string}
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });

    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/showroom-comparison', { layoutIds, criteria }, parsed || aiResult.result);

    res.json({ success: true, comparison: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/product-recommendations
// Personalized product recommendations from browsing behavior
router.post('/product-recommendations', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { customerProfile, viewHistory, cart, catalog, count = 5 } = req.body || {};
    const systemPrompt = 'You are a personalization engine for a virtual showroom. Always respond with valid JSON.';
    const userPrompt = `Recommend ${count} products for this customer.

Customer profile: ${JSON.stringify(customerProfile || {})}
View history: ${JSON.stringify(viewHistory || [])}
Cart: ${JSON.stringify(cart || [])}
Catalog (subset): ${JSON.stringify((catalog || []).slice(0, 50))}

Return JSON:
{
  "recommendations": [{ "productId": "", "rationale": "", "confidence": 0, "crossSellWith": [""] }],
  "summary": ""
}`;
    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });
    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/product-recommendations', { count, customerProfile }, parsed || aiResult.result);
    res.json({ success: true, recommendations: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/merchandising-optimizer
// Visual merchandising suggestions based on conversion data
router.post('/merchandising-optimizer', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    const { layoutId, conversionData, traffic, season } = req.body || {};
    const systemPrompt = 'You are a visual merchandising consultant. Always respond with valid JSON.';
    const userPrompt = `Suggest product placement changes to improve conversion.

Layout: ${layoutId || 'unknown'}
Conversion data: ${JSON.stringify(conversionData || [])}
Traffic / heatmap: ${JSON.stringify(traffic || {})}
Season / context: ${season || 'n/a'}

Return JSON:
{
  "moves": [{ "productId": "", "fromZone": "", "toZone": "", "rationale": "", "expectedLiftPct": 0 }],
  "anchors": [{ "zone": "", "productId": "", "reason": "" }],
  "summary": ""
}`;
    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) return res.status(500).json({ error: aiResult.error });
    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/merchandising-optimizer', { layoutId, season }, parsed || aiResult.result);
    res.json({ success: true, plan: parsed || aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/seasonal-layout-recommendation
// Seasonal showroom layout recommendation aligned with calendar / promotions
router.post('/seasonal-layout-recommendation', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.' });
    }
    const { season, region, targetAudience, themes, productCategories, dimensions, businessGoals, holidays } = req.body || {};
    if (!season) return res.status(400).json({ error: 'season is required (e.g. spring, summer, fall, winter, holiday)' });

    const systemPrompt = 'You are an expert seasonal merchandising and showroom-layout strategist. Always respond with valid JSON.';
    const userPrompt = `Generate a seasonal showroom layout recommendation.

Season: ${season}
Region: ${region || 'global'}
Target audience: ${targetAudience || 'general consumers'}
Seasonal themes: ${JSON.stringify(themes || [])}
Product categories to feature: ${JSON.stringify(productCategories || [])}
Dimensions: ${dimensions ? JSON.stringify(dimensions) : 'unspecified'}
Business goals: ${JSON.stringify(businessGoals || ['increase conversion', 'increase AOV'])}
Relevant holidays / events: ${JSON.stringify(holidays || [])}

Return JSON:
{
  "season": "${season}",
  "themeName": "string",
  "colorPalette": [{ "role": "primary|accent|background", "hex": "#" }],
  "zones": [{ "name": "", "purpose": "", "featuredCategories": [""], "rationale": "", "priority": "high|medium|low" }],
  "productSpotlights": [{ "category": "", "rationale": "", "expectedLiftPct": 0 }],
  "lightingPlan": [{ "zone": "", "type": "", "intensity": "", "colorTemp": "" }],
  "promotionalHooks": [{ "hook": "", "tieIn": "", "channel": "" }],
  "rotationCalendar": [{ "weekOf": "", "swap": "" }],
  "kpiTargets": [{ "metric": "", "target": "" }],
  "summary": ""
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) {
      const msg = (aiResult.error || '').toLowerCase();
      if (msg.includes('api key') || msg.includes('openrouter')) {
        return res.status(503).json({ error: aiResult.error });
      }
      return res.status(500).json({ error: aiResult.error });
    }
    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/seasonal-layout-recommendation', { season, region, targetAudience }, parsed || aiResult.result);
    res.json({ success: true, layout: parsed || aiResult.result, raw: aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/customer-journey-heatmap
// MECHANICAL: aggregates `customer_analytics` + `conversion_events` data into a journey
// heatmap. PRODUCT-DECISION: stages defaulted to a typical retail funnel
// [enter, browse, engage, try_on, cart, checkout] — overridable via body.stages.
// Env: OPENROUTER_API_KEY.
router.post('/customer-journey-heatmap', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.', missing: 'OPENROUTER_API_KEY' });
    }
    // PRODUCT-DECISION: default funnel stages cover a typical virtual-showroom journey.
    const { stages = ['enter', 'browse', 'engage', 'try_on', 'cart', 'checkout'], days_back = 30, segment } = req.body || {};

    // Pull lightweight aggregates — additive, no schema changes.
    let analytics = { rows: [] };
    let conversions = { rows: [] };
    try {
      const segClause = segment ? `AND segment = '${String(segment).replace(/'/g, "''")}'` : '';
      analytics = await pool.query(
        `SELECT metric_name, metric_type, period, segment, trend, AVG(metric_value::numeric) AS avg_value, COUNT(*) AS samples
         FROM customer_analytics
         WHERE created_at >= NOW() - INTERVAL '${parseInt(days_back) || 30} days' ${segClause}
         GROUP BY metric_name, metric_type, period, segment, trend
         ORDER BY samples DESC LIMIT 100`
      );
    } catch (e) { /* table may not exist yet */ }
    try {
      conversions = await pool.query(
        `SELECT event_type, COUNT(*) AS event_count, SUM(value::numeric) AS total_value
         FROM conversion_events
         WHERE created_at >= NOW() - INTERVAL '${parseInt(days_back) || 30} days'
         GROUP BY event_type ORDER BY event_count DESC LIMIT 50`
      );
    } catch (e) { /* table may not exist yet */ }

    const systemPrompt = 'You are an expert customer-journey analyst for virtual showrooms. Always respond with valid JSON.';
    const userPrompt = `Build a customer-journey heatmap for the funnel stages ${JSON.stringify(stages)} over the last ${days_back} days${segment ? ` (segment: ${segment})` : ''}.

Analytics aggregates:
${JSON.stringify(analytics.rows, null, 2)}

Conversion events:
${JSON.stringify(conversions.rows, null, 2)}

Return JSON:
{
  "stages": [{ "name": "string", "intensity": 0-100, "estimated_visitors": 0, "drop_off_pct": 0, "avg_dwell_seconds": 0, "top_actions": ["string array"], "issues": ["string array"] }],
  "heat_map": [{ "x_zone": "entrance|left|center|right|back", "y_zone": "front|mid|rear", "intensity": 0-100, "dominant_action": "string" }],
  "drop_off_diagnosis": [{ "from_stage": "string", "to_stage": "string", "loss_pct": 0, "likely_cause": "string", "recommended_fix": "string" }],
  "personalization_opportunities": ["string array"],
  "summary": "string"
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) {
      const msg = (aiResult.error || '').toLowerCase();
      if (msg.includes('api key') || msg.includes('openrouter')) {
        return res.status(503).json({ error: aiResult.error });
      }
      return res.status(500).json({ error: aiResult.error });
    }
    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/customer-journey-heatmap', { stages, days_back, segment }, parsed || aiResult.result);
    res.json({ success: true, heatmap: parsed || aiResult.result, raw: aiResult.result, data: { analytics: analytics.rows, conversions: conversions.rows } });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// POST /api/ai/competitor-showroom-analysis
// NEEDS-PRODUCT-DECISION → reasonable default: do NOT scrape competitor sites.
// Caller supplies competitor descriptions (text or list of URLs+notes); LLM compares
// against our showroom (read from store_layouts/themes) and produces a positioning report.
// PRODUCT-DECISION: input-driven only — no external network calls.
// Env: OPENROUTER_API_KEY.
router.post('/competitor-showroom-analysis', authenticateToken, aiRateLimiter, async (req, res) => {
  try {
    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(503).json({ error: 'OpenRouter API key not configured. Please set OPENROUTER_API_KEY in .env file.', missing: 'OPENROUTER_API_KEY' });
    }
    const { competitors = [], focus_areas = ['layout', 'pricing', 'merchandising', 'ux', 'branding'] } = req.body || {};
    if (!Array.isArray(competitors) || competitors.length === 0) {
      return res.status(400).json({ error: 'competitors[] is required (each item: { name, description?, urls?, notes? })' });
    }

    let layouts = { rows: [] }; let themes = { rows: [] };
    try { layouts = await pool.query('SELECT id, name, layout_type, dimensions, products, status FROM store_layouts ORDER BY created_at DESC LIMIT 25'); } catch (e) {}
    try { themes = await pool.query('SELECT id, name, theme_type, color_palette, mood FROM store_themes ORDER BY created_at DESC LIMIT 25'); } catch (e) {}

    const systemPrompt = 'You are a competitive intelligence analyst for retail virtual showrooms. Always respond with valid JSON. Reason ONLY from supplied competitor descriptions — never invent facts.';
    const userPrompt = `Compare our showroom against the supplied competitors on focus areas ${JSON.stringify(focus_areas)}.

Our layouts: ${JSON.stringify(layouts.rows, null, 2)}
Our themes: ${JSON.stringify(themes.rows, null, 2)}
Competitors (caller-supplied):
${JSON.stringify(competitors, null, 2)}

Return JSON:
{
  "per_competitor": [{ "name": "string", "strengths": ["string array"], "weaknesses": ["string array"], "differentiators": ["string array"], "estimated_threat_level": "low|medium|high" }],
  "feature_matrix": [{ "feature": "string", "us": "string", "competitors": [{ "name": "string", "value": "string" }] }],
  "positioning_gaps": ["string array"],
  "opportunities": [{ "area": "string", "play": "string", "expected_impact": "string", "effort": "low|medium|high" }],
  "messaging_recommendations": ["string array"],
  "summary": "string"
}`;

    const aiResult = await callOpenRouter(systemPrompt, userPrompt);
    if (!aiResult.success) {
      const msg = (aiResult.error || '').toLowerCase();
      if (msg.includes('api key') || msg.includes('openrouter')) {
        return res.status(503).json({ error: aiResult.error });
      }
      return res.status(500).json({ error: aiResult.error });
    }
    const parsed = parseAIJson(aiResult.result);
    await persistAIResult(req.user.id, '/api/ai/competitor-showroom-analysis', { competitors_count: competitors.length, focus_areas }, parsed || aiResult.result);
    res.json({ success: true, analysis: parsed || aiResult.result, raw: aiResult.result });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

export default router;
