import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { ArrowLeft, Plus, Trash2, Edit3, Sparkles, X } from 'lucide-react';

const fieldConfigs = {
  products: {
    columns: ['name', 'category', 'price', 'sku', 'status'],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'category', label: 'Category', type: 'text' },
      { key: 'price', label: 'Price', type: 'number', required: true },
      { key: 'image_url', label: 'Image URL', type: 'text' },
      { key: 'sku', label: 'SKU', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
  },
  models3d: {
    columns: ['product_name', 'polygon_count', 'file_format', 'dimensions', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'model_url', label: 'Model URL', type: 'text' },
      { key: 'polygon_count', label: 'Polygon Count', type: 'number' },
      { key: 'file_format', label: 'Format', type: 'select', options: ['GLB', 'OBJ', 'FBX'] },
      { key: 'texture_maps', label: 'Texture Maps', type: 'text' },
      { key: 'dimensions', label: 'Dimensions', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'completed'] },
    ],
  },
  layouts: {
    columns: ['name', 'layout_type', 'zone_count', 'total_area', 'status'],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'layout_type', label: 'Layout Type', type: 'text' },
      { key: 'zone_count', label: 'Zone Count', type: 'number' },
      { key: 'total_area', label: 'Total Area', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'active'] },
    ],
  },
  artryons: {
    columns: ['customer_name', 'product_name', 'fit_accuracy', 'size_recommendation', 'style_score', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { key: 'fit_accuracy', label: 'Fit Accuracy (%)', type: 'number' },
      { key: 'body_landmarks', label: 'Body Landmarks', type: 'number' },
      { key: 'size_recommendation', label: 'Size', type: 'select', options: ['XS', 'S', 'M', 'L', 'XL', 'OS'] },
      { key: 'style_score', label: 'Style Score', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'completed'] },
    ],
  },
  analytics: {
    columns: ['metric_name', 'metric_value', 'metric_type', 'period', 'segment', 'trend'],
    formFields: [
      { key: 'metric_name', label: 'Metric Name', type: 'text', required: true },
      { key: 'metric_value', label: 'Value', type: 'number', required: true },
      { key: 'metric_type', label: 'Type', type: 'text' },
      { key: 'period', label: 'Period', type: 'text' },
      { key: 'segment', label: 'Segment', type: 'text' },
      { key: 'trend', label: 'Trend', type: 'select', options: ['up', 'down', 'stable'] },
    ],
  },
  conversions: {
    columns: ['event_type', 'source', 'product_name', 'revenue', 'funnel_stage', 'device'],
    formFields: [
      { key: 'event_type', label: 'Event Type', type: 'text', required: true },
      { key: 'source', label: 'Source', type: 'text' },
      { key: 'product_id', label: 'Product ID', type: 'number' },
      { key: 'customer_email', label: 'Customer Email', type: 'text' },
      { key: 'revenue', label: 'Revenue', type: 'number' },
      { key: 'funnel_stage', label: 'Funnel Stage', type: 'select', options: ['awareness', 'intent', 'engagement', 'completed', 'dropped', 'acquisition'] },
      { key: 'device', label: 'Device', type: 'select', options: ['desktop', 'mobile', 'tablet'] },
    ],
  },
  descriptions: {
    columns: ['product_name', 'headline', 'tone', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'headline', label: 'Headline', type: 'text' },
      { key: 'short_description', label: 'Short Description', type: 'textarea' },
      { key: 'long_description', label: 'Long Description', type: 'textarea' },
      { key: 'seo_tags', label: 'SEO Tags', type: 'text' },
      { key: 'tone', label: 'Tone', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['draft', 'generated', 'published'] },
    ],
  },
  styles: {
    columns: ['customer_name', 'style_profile', 'confidence_score', 'status'],
    formFields: [
      { key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { key: 'style_profile', label: 'Style Profile', type: 'text' },
      { key: 'confidence_score', label: 'Confidence Score', type: 'number' },
      { key: 'recommended_products', label: 'Recommended Products', type: 'textarea' },
      { key: 'trending_combos', label: 'Trending Combos', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
  },
  pricing: {
    columns: ['product_name', 'current_price', 'recommended_price', 'market_position', 'elasticity_score', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'current_price', label: 'Current Price', type: 'number' },
      { key: 'recommended_price', label: 'Recommended Price', type: 'number' },
      { key: 'market_position', label: 'Market Position', type: 'text' },
      { key: 'elasticity_score', label: 'Elasticity Score', type: 'number' },
      { key: 'revenue_impact', label: 'Revenue Impact', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'analyzed', 'applied'] },
    ],
  },
  customers: {
    columns: ['name', 'email', 'segment', 'lifetime_value', 'total_orders', 'status'],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'email', label: 'Email', type: 'text', required: true },
      { key: 'phone', label: 'Phone', type: 'text' },
      { key: 'segment', label: 'Segment', type: 'select', options: ['regular', 'premium', 'vip'] },
      { key: 'lifetime_value', label: 'Lifetime Value', type: 'number' },
      { key: 'total_orders', label: 'Total Orders', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'] },
    ],
  },
  orders: {
    columns: ['customer_name', 'total_amount', 'status', 'payment_method', 'created_at'],
    formFields: [
      { key: 'customer_id', label: 'Customer ID', type: 'number', required: true },
      { key: 'total_amount', label: 'Total Amount', type: 'number', required: true },
      { key: 'status', label: 'Status', type: 'select', options: ['pending', 'processing', 'shipped', 'delivered'] },
      { key: 'shipping_address', label: 'Shipping Address', type: 'textarea' },
      { key: 'payment_method', label: 'Payment Method', type: 'select', options: ['credit_card', 'debit_card', 'paypal'] },
    ],
  },
  themes: {
    columns: ['name', 'primary_color', 'font_family', 'layout_style', 'status'],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'primary_color', label: 'Primary Color', type: 'text' },
      { key: 'secondary_color', label: 'Secondary Color', type: 'text' },
      { key: 'accent_color', label: 'Accent Color', type: 'text' },
      { key: 'font_family', label: 'Font Family', type: 'text' },
      { key: 'layout_style', label: 'Layout Style', type: 'text' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'draft'] },
    ],
  },
  promotions: {
    columns: ['name', 'code', 'discount_type', 'discount_value', 'used_count', 'status'],
    formFields: [
      { key: 'name', label: 'Name', type: 'text', required: true },
      { key: 'code', label: 'Code', type: 'text', required: true },
      { key: 'discount_type', label: 'Discount Type', type: 'select', options: ['percentage', 'fixed'] },
      { key: 'discount_value', label: 'Discount Value', type: 'number' },
      { key: 'min_purchase', label: 'Min Purchase', type: 'number' },
      { key: 'start_date', label: 'Start Date', type: 'text' },
      { key: 'end_date', label: 'End Date', type: 'text' },
      { key: 'usage_limit', label: 'Usage Limit', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['active', 'expired', 'paused'] },
    ],
  },
  reviews: {
    columns: ['product_name', 'customer_name', 'rating', 'title', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'customer_name', label: 'Customer Name', type: 'text', required: true },
      { key: 'rating', label: 'Rating (1-5)', type: 'number', required: true },
      { key: 'title', label: 'Title', type: 'text' },
      { key: 'body', label: 'Review Body', type: 'textarea' },
      { key: 'verified_purchase', label: 'Verified Purchase', type: 'select', options: ['true', 'false'] },
      { key: 'status', label: 'Status', type: 'select', options: ['published', 'pending', 'hidden'] },
    ],
  },
  inventory: {
    columns: ['product_name', 'warehouse', 'quantity', 'reserved', 'reorder_level', 'status'],
    formFields: [
      { key: 'product_id', label: 'Product ID', type: 'number', required: true },
      { key: 'warehouse', label: 'Warehouse', type: 'text', required: true },
      { key: 'quantity', label: 'Quantity', type: 'number', required: true },
      { key: 'reserved', label: 'Reserved', type: 'number' },
      { key: 'reorder_level', label: 'Reorder Level', type: 'number' },
      { key: 'reorder_quantity', label: 'Reorder Quantity', type: 'number' },
      { key: 'status', label: 'Status', type: 'select', options: ['in_stock', 'low_stock', 'out_of_stock'] },
    ],
  },
};

function formatValue(key, value) {
  if (value === null || value === undefined) return '—';
  if (key === 'price' || key === 'current_price' || key === 'recommended_price' || key === 'total_amount' || key === 'revenue' || key === 'lifetime_value' || key === 'discount_value' || key === 'min_purchase') {
    return `$${parseFloat(value).toFixed(2)}`;
  }
  if (key === 'metric_value') return parseFloat(value).toLocaleString();
  if (key === 'fit_accuracy' || key === 'confidence_score') return `${value}%`;
  if (key === 'rating') return '★'.repeat(parseInt(value)) + '☆'.repeat(5 - parseInt(value));
  if (key === 'created_at' || key === 'updated_at') return new Date(value).toLocaleDateString();
  if (key === 'primary_color' || key === 'secondary_color' || key === 'accent_color') {
    return <><span className="color-preview" style={{ backgroundColor: value }}></span>{value}</>;
  }
  if (key === 'polygon_count') return parseInt(value).toLocaleString();
  return String(value);
}

function renderMarkdown(text) {
  if (!text) return null;
  let html = text
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^\- (.+)$/gm, '<li>$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
    .replace(/\|(.+)\|/g, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return '';
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br/>');
  html = html.replace(/(<tr>.*<\/tr>)/gs, '<table>$1</table>');
  return <div className="ai-content" dangerouslySetInnerHTML={{ __html: `<p>${html}</p>` }} />;
}

export default function FeaturePage({ resource, title, subtitle, aiFeature, isAI }) {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const config = fieldConfigs[resource] || { columns: [], formFields: [] };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAll(resource);
      setItems(data);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setLoading(false);
  }, [resource]);

  useEffect(() => {
    fetchData();
    setSelected(null);
    setShowForm(false);
    setAiResult(null);
  }, [resource, fetchData]);

  const handleRowClick = async (item) => {
    try {
      const detail = await api.getOne(resource, item.id);
      setSelected(detail);
      setAiResult(null);
    } catch {
      setSelected(item);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await api.remove(resource, id);
      showToast('Item deleted successfully');
      setSelected(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleEdit = (item) => {
    setEditItem(item);
    const data = {};
    config.formFields.forEach(f => {
      data[f.key] = item[f.key] !== null && item[f.key] !== undefined ? String(item[f.key]) : '';
    });
    setFormData(data);
    setShowForm(true);
  };

  const handleNew = () => {
    setEditItem(null);
    const data = {};
    config.formFields.forEach(f => { data[f.key] = ''; });
    setFormData(data);
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      config.formFields.forEach(f => {
        if (f.type === 'number' && payload[f.key]) payload[f.key] = parseFloat(payload[f.key]);
      });
      if (editItem) {
        await api.update(resource, editItem.id, payload);
        showToast('Item updated successfully');
      } else {
        await api.create(resource, payload);
        showToast('Item created successfully');
      }
      setShowForm(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAI = async (id) => {
    setAiLoading(true);
    try {
      const result = await api[aiFeature](id);
      setAiResult(result);
    } catch (err) {
      showToast(err.message, 'error');
    }
    setAiLoading(false);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <span>Loading {title}...</span>
      </div>
    );
  }

  // Detail view
  if (selected) {
    const allFields = Object.keys(selected).filter(k => k !== 'id' && !k.endsWith('_image'));
    return (
      <div>
        <button className="back-btn" onClick={() => setSelected(null)}>
          <ArrowLeft size={16} /> Back to {title}
        </button>
        <div className="detail-view">
          <div className="detail-header">
            <div>
              <h2>{selected.name || selected.metric_name || selected.customer_name || selected.headline || selected.event_type || `${title} #${selected.id}`}</h2>
              {selected.status && <span className={`status-badge status-${selected.status}`}>{selected.status}</span>}
            </div>
            <div className="detail-actions">
              {isAI && aiFeature && (
                <button className="btn btn-ai btn-sm" onClick={() => handleAI(selected.id)} disabled={aiLoading}>
                  {aiLoading ? <><span className="spinner"></span> Analyzing...</> : <><Sparkles size={16} /> Run AI Analysis</>}
                </button>
              )}
              <button className="btn btn-secondary btn-sm" onClick={() => handleEdit(selected)}>
                <Edit3 size={16} /> Edit
              </button>
              <button className="btn btn-danger btn-sm" onClick={() => handleDelete(selected.id)}>
                <Trash2 size={16} /> Delete
              </button>
            </div>
          </div>

          <div className="detail-grid">
            {allFields.map(key => (
              <div key={key} className="detail-field">
                <label>{key.replace(/_/g, ' ')}</label>
                <div className="value">{formatValue(key, selected[key])}</div>
              </div>
            ))}
          </div>

          {/* AI Output Display */}
          {aiResult && (
            <div className="ai-output">
              <div className="ai-output-header">
                <div className="ai-icon">
                  <Sparkles size={18} color="white" />
                </div>
                <h3>AI Analysis Result</h3>
                {aiResult.model && <span className="model-tag">{aiResult.model}</span>}
                {aiResult.mock && <span className="model-tag">Demo Mode</span>}
              </div>
              {renderMarkdown(aiResult.result)}
              {aiResult.usage && (
                <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px solid rgba(139,92,246,0.15)', fontSize: 12, color: 'var(--text-muted)', display: 'flex', gap: 20 }}>
                  <span>Tokens: {aiResult.usage.total_tokens}</span>
                  <span>Prompt: {aiResult.usage.prompt_tokens}</span>
                  <span>Completion: {aiResult.usage.completion_tokens}</span>
                </div>
              )}
            </div>
          )}

          {/* Show existing AI data if available */}
          {!aiResult && (selected.ai_analysis || selected.ai_output || selected.ai_suggestions) && (
            <div className="ai-output">
              <div className="ai-output-header">
                <div className="ai-icon">
                  <Sparkles size={18} color="white" />
                </div>
                <h3>Previous AI Analysis</h3>
              </div>
              {renderMarkdown(selected.ai_analysis || selected.ai_output || selected.ai_suggestions)}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Table view
  return (
    <div>
      <div className="page-header">
        <div>
          <h1>{title}</h1>
          <p className="subtitle">{subtitle} &middot; {items.length} items</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={handleNew}>
            <Plus size={18} /> New Item
          </button>
        </div>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              {config.columns.map(col => (
                <th key={col}>{col.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} onClick={() => handleRowClick(item)}>
                <td>{idx + 1}</td>
                {config.columns.map(col => (
                  <td key={col}>
                    {col === 'status' || col === 'trend' || col === 'funnel_stage' ? (
                      <span className={`status-badge status-${item[col]}`}>{item[col]}</span>
                    ) : (
                      formatValue(col, item[col])
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>{editItem ? 'Edit Item' : 'Create New Item'}</h2>
              <button className="back-btn" onClick={() => setShowForm(false)} style={{ margin: 0 }}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              {config.formFields.map(field => (
                <div className="form-group" key={field.key}>
                  <label>{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                    >
                      <option value="">Select...</option>
                      {field.options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      rows={3}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  ) : (
                    <input
                      type={field.type}
                      step={field.type === 'number' ? 'any' : undefined}
                      value={formData[field.key] || ''}
                      onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ width: 'auto' }}>
                  {editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <div className={`toast ${toast.type}`}>{toast.message}</div>}
    </div>
  );
}
