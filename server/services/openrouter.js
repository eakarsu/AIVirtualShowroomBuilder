import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY?.trim();
const OPENROUTER_MODEL = process.env.OPENROUTER_MODEL?.trim();
const OPENROUTER_BASE_URL = process.env.OPENROUTER_BASE_URL?.trim().replace(/\/$/, '');

export async function callOpenRouter(systemPrompt, userPrompt) {
  if (!OPENROUTER_API_KEY) throw new Error('OPENROUTER_API_KEY is required');
  if (!OPENROUTER_MODEL) throw new Error('OPENROUTER_MODEL is required');
  if (OPENROUTER_BASE_URL !== 'https://openrouter.ai/api/v1') {
    throw new Error('OPENROUTER_BASE_URL must be https://openrouter.ai/api/v1');
  }

  try {
    const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'http://localhost:5173',
        'X-Title': 'AI Virtual Showroom Builder'
      },
      body: JSON.stringify({
        model: OPENROUTER_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok || data.error) {
      return { success: false, error: data.error.message || 'OpenRouter API error' };
    }

    const content = data.choices?.[0]?.message?.content;
    if (typeof content !== 'string' || !content.trim()) {
      return { success: false, error: 'OpenRouter returned an empty response' };
    }
    return {
      success: true,
      result: content,
      model: data.model || OPENROUTER_MODEL,
      usage: data.usage
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

function generateMockResponse(systemPrompt, userPrompt) {
  if (systemPrompt.includes('3D model')) {
    return `## 3D Model Analysis\n\n**Object Detection:** Product identified successfully\n**Geometry:** Complex mesh with 12,450 polygons\n**Texture Maps:** Diffuse, Normal, Roughness generated\n**Dimensions:** 30cm x 20cm x 15cm\n**File Formats:** GLB, OBJ, FBX ready\n\n### Recommendations\n- Optimize mesh for web viewing (reduce to 5,000 polygons)\n- Add ambient occlusion for realistic shadows\n- Enable PBR materials for accurate lighting`;
  }
  if (systemPrompt.includes('store layout')) {
    return `## Virtual Store Layout\n\n**Layout Type:** Modern Grid with Featured Sections\n**Total Area:** 2,400 sq ft virtual space\n\n### Zones\n1. **Hero Zone** - Featured products with 360° view\n2. **Browse Gallery** - Grid layout, 4 columns\n3. **Try-On Station** - AR-enabled display area\n4. **Checkout Lounge** - Streamlined purchase flow\n\n### Color Palette\n- Primary: #1a1a2e (Deep Navy)\n- Accent: #e94560 (Coral Red)\n- Background: #f5f5f5 (Light Gray)`;
  }
  if (systemPrompt.includes('try-on') || systemPrompt.includes('AR')) {
    return `## AR Try-On Analysis\n\n**Compatibility:** High - suitable for virtual try-on\n**Body Tracking Points:** 17 key landmarks detected\n**Fit Accuracy:** 94.2%\n\n### Virtual Fit Report\n- **Size Recommendation:** Medium (based on body measurements)\n- **Color Match:** Complements detected skin tone\n- **Style Score:** 8.5/10\n\n### AR Overlay Settings\n- Opacity: 0.95\n- Shadow Intensity: Medium\n- Reflection: Enabled`;
  }
  if (systemPrompt.includes('description') || systemPrompt.includes('product copy')) {
    return `## Product Description\n\n**Headline:** Elevate Your Style with Timeless Elegance\n\n**Short Description:**\nCrafted with premium materials and meticulous attention to detail, this piece combines modern aesthetics with lasting comfort.\n\n**Key Features:**\n- Premium quality construction\n- Versatile design for any occasion\n- Sustainable and ethically sourced materials\n- Available in 5 stunning colorways\n\n**SEO Tags:** premium, designer, sustainable, modern, versatile`;
  }
  if (systemPrompt.includes('style') || systemPrompt.includes('recommend')) {
    return `## Style Recommendations\n\n**Customer Profile:** Modern Minimalist\n**Confidence Score:** 92%\n\n### Recommended Pairings\n1. **Classic White Sneakers** - Versatility score: 9/10\n2. **Structured Tote Bag** - Style match: 95%\n3. **Minimal Gold Watch** - Elegance boost: +15%\n\n### Trending Combinations\n- Pair with earth tones for Fall 2024\n- Layer with oversized outerwear\n- Accessorize with geometric jewelry`;
  }
  if (systemPrompt.includes('price') || systemPrompt.includes('pricing')) {
    return `## Price Optimization Analysis\n\n**Current Price:** Analyzed\n**Market Position:** Mid-Premium Segment\n\n### Recommendations\n| Strategy | Price Point | Expected Revenue Impact |\n|----------|-----------|------------------------|\n| Penetration | -15% | +25% volume |\n| Optimal | Current | Balanced |\n| Premium | +10% | +8% margin |\n\n**Recommended:** Optimal pricing with seasonal 10% promotions\n**Elasticity Score:** 0.73 (relatively inelastic)`;
  }
  return `## AI Analysis Complete\n\n**Status:** Processed successfully\n**Confidence:** 89%\n\nThe analysis has been completed with detailed insights. Please configure your OpenRouter API key for live AI-powered results.`;
}
