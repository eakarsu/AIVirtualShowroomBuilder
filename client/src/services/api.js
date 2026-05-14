const API_BASE = '/api';

function getHeaders() {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
}

async function request(method, path, body = null) {
  const opts = { method, headers: getHeaders() };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${API_BASE}${path}`, opts);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (email, password) => request('POST', '/auth/login', { email, password }),
  register: (email, password, name) => request('POST', '/auth/register', { email, password, name }),

  // Generic CRUD
  getAll: (resource) => request('GET', `/${resource}`),
  getOne: (resource, id) => request('GET', `/${resource}/${id}`),
  create: (resource, data) => request('POST', `/${resource}`, data),
  update: (resource, id, data) => request('PUT', `/${resource}/${id}`, data),
  remove: (resource, id) => request('DELETE', `/${resource}/${id}`),

  // Per-resource AI endpoints
  generate3D: (id) => request('POST', `/models3d/${id}/generate`),
  generateLayout: (id) => request('POST', `/layouts/${id}/generate`),
  analyzeARTryon: (id) => request('POST', `/artryons/${id}/analyze`),
  generateDescription: (id) => request('POST', `/descriptions/${id}/generate`),
  generateStyle: (id) => request('POST', `/styles/${id}/generate`),
  optimizePrice: (id) => request('POST', `/pricing/${id}/optimize`),

  // Advanced AI Tools
  aiResults: (page = 1, limit = 20) => request('GET', `/ai/results?page=${page}&limit=${limit}`),
  roomLayoutOptimizer: (payload) => request('POST', '/ai/room-layout-optimizer', payload),
  productDescriptionEnhancer: (payload) => request('POST', '/ai/product-description-enhancer', payload),
  lightingMoodGenerator: (payload) => request('POST', '/ai/lighting-mood-generator', payload),
  visitorBehaviorAnalyzer: (payload) => request('POST', '/ai/visitor-behavior-analyzer', payload),
  showroomComparison: (payload) => request('POST', '/ai/showroom-comparison', payload),
  productRecommendations: (payload) => request('POST', '/ai/product-recommendations', payload),
  merchandisingOptimizer: (payload) => request('POST', '/ai/merchandising-optimizer', payload),
  seasonalLayoutRecommendation: (payload) => request('POST', '/ai/seasonal-layout-recommendation', payload),
  customerJourneyHeatmap: (payload) => request('POST', '/ai/customer-journey-heatmap', payload),
  competitorShowroomAnalysis: (payload) => request('POST', '/ai/competitor-showroom-analysis', payload),
};
