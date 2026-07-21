import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluate } from '../domain.js';

function fixture() {
  return {
  project:{id:'p1',tenantId:'t1',ownerId:'owner',permissionVersion:'perm1',consentVersion:'consent1',retentionDays:30,status:'approved'},
  catalog:[{sku:'sku1',catalogVersion:'c1',inventoryVersion:'i1',priceVersion:'p1',rightsRef:'rights1',availableQuantity:5}],
  layout:{id:'l1',version:'l1',coordinateSystem:'meters-v1',zones:[{id:'z1'}],productSkus:['sku1'],accessibilityChecksPassed:true},
  decision:{id:'d1',projectId:'p1',layoutVersion:'l1',catalogVersion:'c1',uncertaintyNote:'provider validation pending',autonomousPublish:false,humanApproved:true,approvedBy:'reviewer',constraintsPassed:true},
  execution:{status:'receipt_recorded',feedbackAt:'2026-07-18T00:00:00Z',receiptRef:'receipt:showroom:1'},
  validation:{fixtureVersion:'f1',correctness:true,edgeCases:true,failurePaths:true,latencyMs:20,realizedOutcomeRecorded:true,reconciled:true},
  fixtures:{catalogCorrection:true,inventoryConflict:true,webhookRetry:true,publicationRollback:true}
};
}

test('accepts governed showroom publication', () => {
  const result = evaluate(fixture(), { tenant: 't1', actor: 'owner' });
  assert.deepEqual(result.errors, []);
});

test('blocks unsafe or ungoverned showroom publication', () => {
  const input = fixture();
  input.decision.autonomousPublish = true;
  assert.ok(evaluate(input, { tenant: 't1', actor: 'owner' }).errors.length > 0);
  assert.ok(evaluate(fixture(), { tenant: 'other', actor: 'owner' }).errors.length > 0);
});
