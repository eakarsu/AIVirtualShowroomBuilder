# Audit Recommendations & Status — AIVirtualShowroomBuilder

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_08.md (section 32)

Verdict per audit: partial-build, 6 AI endpoints, ai.js 308 lines.

## Original audit recommendations

Missing AI counterparts:
- AI-driven product recommendations
- AI-driven visual merchandising

Missing non-AI:
- E-commerce platform integrations (Shopify, WooCommerce)
- AR/VR platform integration (WebAR, WebXR)
- Customer path analysis / heatmap
- Inventory sync with POS

Custom feature ideas:
- Personalized product recommendations
- Visual merchandising optimizer
- Customer journey heatmap
- Competitor showroom analysis
- Seasonal layout recommendation

## Implemented in this pass (MECHANICAL)

Added two new endpoints to existing `server/routes/ai.js` (ESM, matches existing style: `callOpenRouter`, `parseAIJson`, `persistAIResult`, `aiRateLimiter`).

- `POST /api/ai/product-recommendations` — personalized recommendations from customer profile and history.
- `POST /api/ai/merchandising-optimizer` — visual-merchandising plan with expected lift estimates.

## Backlog

1. Seasonal layout recommendation — could be added as a third text-only endpoint; deferred to keep this pass focused.
2. Competitor showroom analysis — needs external scraping/data decision.
3. Shopify / WooCommerce integrations — credentials decision.
4. AR/VR (WebAR/WebXR) integration — substantial frontend product work.
5. POS inventory sync — credentials decision.

## Apply pass 3 (frontend)

FE already wired. The existing `AIToolsHub` page and `services/api.js` route all 8 advanced AI endpoints (`/ai/room-layout-optimizer`, `/ai/product-description-enhancer`, `/ai/lighting-mood-generator`, `/ai/visitor-behavior-analyzer`, `/ai/showroom-comparison`, `/ai/product-recommendations`, `/ai/merchandising-optimizer`, `/ai/results`). The two endpoints added in pass 2 (`product-recommendations`, `merchandising-optimizer`) already had FE counterparts in `client/src/pages/ProductRecommendations.jsx` and `client/src/pages/MerchandisingOptimizer.jsx` plus the AIToolsHub tile and route.

- Action: LEFT-AS-IS — FE already wired
- No files modified

## Apply pass 4 (mechanical backlog)

Picked up the first deferred MECHANICAL backlog item ("Seasonal layout recommendation"). The other backlog items are NEEDS-CREDS / TOO-RISKY / NEEDS-PRODUCT-DECISION.

- **Seasonal Layout Recommendation** — `POST /api/ai/seasonal-layout-recommendation` (BE: `server/routes/ai.js`). Inputs: season, region, target audience, themes, product categories, dimensions, business goals, holidays. LLM returns theme name, color palette, zones, product spotlights, lighting plan, promotional hooks, weekly rotation calendar, KPI targets.

Backend:
- Reuses existing `callOpenRouter` + `parseAIJson` + `persistAIResult` + `aiRateLimiter`.
- Explicit 503 guard for missing or placeholder `OPENROUTER_API_KEY` (matches the `your_openrouter_api_key_here` sentinel used by `services/openrouter.js`).
- Returns 503 even when the inner helper returns `{ success: false }` if the error mentions "api key" / "openrouter".

Frontend:
- File added: `client/src/pages/SeasonalLayoutRecommendation.jsx` (mirrors `ProductRecommendations.jsx` / `MerchandisingOptimizer.jsx` style — `back-btn`, `card`, `form-group`, `AIResultPanel`, lucide icons).
- Files modified: `client/src/App.jsx` (new route `/ai-tools/seasonal-layout`), `client/src/pages/AIToolsHub.jsx` (new tile), `client/src/services/api.js` (`seasonalLayoutRecommendation` helper).
- Auth: existing JWT-bearer pattern via `localStorage` token in `services/api.js`.
- 503 / "AI not configured" yellow banner branch added in the page.

- Smoke test: PASS — server boots, login OK, endpoint returns HTTP 503 with the placeholder env value.
- Syntax check: `node --check server/routes/ai.js` PASS, `@babel/parser` PASS on the 3 modified/new client files.

## Apply pass 5 (all backlog)

Picked up 2 remaining backlog items implementable within constraints. The remaining (Shopify/WooCommerce/POS sync, AR/VR integration) are NEEDS-CREDS / TOO-RISKY.

- **Customer Journey Heatmap** — `POST /api/ai/customer-journey-heatmap` (MECHANICAL + PRODUCT-DECISION). Aggregates `customer_analytics` + `conversion_events` (graceful no-op on missing tables); LLM returns per-stage intensities, drop-off diagnosis, personalization opportunities. PRODUCT-DECISION: default funnel stages [enter, browse, engage, try_on, cart, checkout] — overridable via body.stages.
- **Competitor Showroom Analysis** — `POST /api/ai/competitor-showroom-analysis` (NEEDS-PRODUCT-DECISION). PRODUCT-DECISION: do NOT scrape competitor sites — caller supplies competitor descriptions (text/URLs/notes); LLM compares against own `store_layouts` / `store_themes` and produces feature matrix, positioning gaps, opportunities.

Backend:
- Both endpoints reuse `callOpenRouter` + `parseAIJson` + `persistAIResult` + `aiRateLimiter`.
- Explicit 503 guard for missing/placeholder `OPENROUTER_API_KEY`; response shape includes `missing: 'OPENROUTER_API_KEY'`.

Frontend:
- Files added: `client/src/pages/CustomerJourneyHeatmap.jsx`, `client/src/pages/CompetitorShowroomAnalysis.jsx` (mirror existing AI-tool page style: `back-btn`, `card`, `form-group`, `AIResultPanel`, lucide icons).
- Files modified: `client/src/App.jsx` (2 routes), `client/src/pages/AIToolsHub.jsx` (2 tiles), `client/src/services/api.js` (2 helpers).
- 503 yellow banner branch in both pages.

- Smoke test: PASS — login OK at alt port 3019 with admin@showroom.com / admin123, both endpoints return HTTP 503 with `missing: OPENROUTER_API_KEY`.
- Syntax check: `node --check server/routes/ai.js` PASS, `@babel/parser` PASS on `App.jsx`, `AIToolsHub.jsx`, `services/api.js`, `CustomerJourneyHeatmap.jsx`, `CompetitorShowroomAnalysis.jsx`.
