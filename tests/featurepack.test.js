// Offline only: unset provider keys before importing the app module.
delete process.env.OPENROUTER_API_KEY; delete process.env.OPENAI_API_KEY;
import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import * as fp from '../server/featurepack.js';

const rows = [
  { id: '1', name: 'Oak Chair', description: 'Solid oak', category: 'Furniture', price: 199, sku: 'CHAIR-1', status: 'active', image_url: 'x.png', created_at: '2026-01-01' },
  { id: '2', name: 'Desk Lamp', description: '', category: '', price: 0, sku: 'LAMP-1', status: 'draft', image_url: '', created_at: '2026-01-02' },
];

test('tasks validate, create, list-filter and update', () => {
  const store = fp.createTaskStore();
  assert.throws(() => store.create('t:u', { title: '' }), /required/);
  const saved = store.create('t:u', { title: ' Photograph chair ', status: 'open', linkedId: '1' });
  assert.equal(store.update('t:u', saved.id, { status: 'done' }).status, 'done');
  assert.equal(store.list('t:u', { status: 'done' }).length, 1);
  assert.equal(store.list('t:other', {}).length, 0);
});

test('search/filter and CSV/JSON export preserve values', () => {
  assert.equal(fp.filterRecords(rows, { search: 'oak' }).length, 1);
  assert.equal(fp.filterRecords(rows, { status: 'draft' }).length, 1);
  assert.match(fp.recordsToCsv(rows), /Oak Chair/);
  const json = fp.recordsToJson(rows);
  assert.equal(json.count, 2); assert.equal(json.data[1].price, 0); assert.equal(json.data[1].description, '');
});

test('AI insights are domain-grounded and fallback-labelled without a key', async () => {
  const fallback = fp.buildInsights(rows);
  assert.equal(fallback.catalogCoverage.totalProducts, 2);
  assert.equal(fallback.pricingProfile.zeroPriceCount, 1);
  assert.equal(fallback.pricingProfile.averagePrice, 99.5);
  assert.equal(fallback.merchandisingReadiness.readyForShowroom, false);
  const result = await fp.runAiInsights({ fallback, system: 's', user: 'u', env: {}, fetchFn: async () => { throw new Error('must not be called'); } });
  assert.equal(result.aiGenerated, false);
  assert.match(result.note, /Deterministic fallback/);
  assert.deepEqual(fp.aiSections({ zero: 0, flag: false, empty: '' }).map((s) => s.lines[0]), ['0', 'false', '(empty)']);
});

test('authenticated router: tasks, records search/export, AI insights', async () => {
  const app = express(); app.use(express.json());
  app.use((req, res, next) => req.headers.authorization === 'Bearer [REDACTED]' ? (req.user = { id: 'u', tenantId: 't' }, next()) : res.status(401).json({ error: 'unauthorized' }));
  app.use('/api/featurepack', fp.createFeaturePackRouter({ listRecords: async () => rows, env: {} }));
  const server = app.listen(0); const base = `http://127.0.0.1:${server.address().port}/api/featurepack`;
  try {
    assert.equal((await fetch(`${base}/tasks`)).status, 401);
    const h = { authorization: 'Bearer [REDACTED]', 'content-type': 'application/json' };
    const created = await (await fetch(`${base}/tasks`, { method: 'POST', headers: h, body: JSON.stringify({ title: 'Stage chair' }) })).json();
    assert.equal((await (await fetch(`${base}/tasks/${created.id}`, { method: 'PATCH', headers: h, body: JSON.stringify({ status: 'done' }) })).json()).status, 'done');
    assert.equal((await (await fetch(`${base}/records?search=oak`, { headers: h })).json()).data.length, 1);
    assert.match(await (await fetch(`${base}/records/export?format=csv`, { headers: h })).text(), /Oak Chair/);
    assert.equal((await (await fetch(`${base}/records/export?format=json`, { headers: h })).json()).count, 2);
    const ai = await (await fetch(`${base}/ai/insights`, { method: 'POST', headers: h, body: JSON.stringify({}) })).json();
    assert.equal(ai.aiGenerated, false); assert.ok(ai.sections.length >= 3);
  } finally { server.close(); }
});
