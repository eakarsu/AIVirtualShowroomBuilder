function evaluate(input = {}, context = {}) {
  const errors = [];
  const project = input.project || {};
  const catalog = input.catalog || [];
  const layout = input.layout || {};
  const decision = input.decision || {};
  const execution = input.execution || {};
  const validation = input.validation || {};
  if (!project.id || !project.tenantId || project.tenantId !== context.tenant || !project.ownerId || project.ownerId !== context.actor || !project.permissionVersion || !project.consentVersion
      || !project.retentionDays || !['draft','catalog_synced','designed','submitted','approved','published','failed','recovery'].includes(project.status)) {
    errors.push('scoped showroom project state required');
  }
  const skus = new Set();
  for (const item of catalog) {
    if (!item.sku || skus.has(item.sku) || !item.catalogVersion || !item.inventoryVersion || !item.priceVersion
        || !item.rightsRef || !Number.isInteger(item.availableQuantity) || item.availableQuantity < 0) errors.push('versioned catalog item invalid');
    skus.add(item.sku);
  }
  if (!layout.id || !layout.version || !layout.coordinateSystem || !Array.isArray(layout.zones)
      || !layout.productSkus?.every((sku) => skus.has(sku)) || !layout.accessibilityChecksPassed) errors.push('versioned accessible layout required');
  if (!decision.id || decision.projectId !== project.id || !decision.layoutVersion || !decision.catalogVersion
      || !decision.uncertaintyNote || decision.autonomousPublish || decision.humanApproved !== true
      || !decision.approvedBy || decision.approvedBy === project.ownerId || decision.constraintsPassed !== true) {
    errors.push('independently approved non-autonomous publication required');
  }
  if (!['queued','receipt_recorded','failed','recovery'].includes(execution.status) || !execution.feedbackAt
      || (execution.status === 'receipt_recorded' && !execution.receiptRef)) errors.push('publication receipt or recovery state invalid');
  for (const key of ['fixtureVersion','correctness','edgeCases','failurePaths','latencyMs','realizedOutcomeRecorded','reconciled']) {
    if (validation[key] === undefined) errors.push(`validation ${key} required`);
  }
  for (const key of ['catalogCorrection','inventoryConflict','webhookRetry','publicationRollback']) {
    if (input.fixtures?.[key] !== true) errors.push(`fixture ${key} required`);
  }
  return { errors, result: { projectId: project.id, layoutVersion: layout.version, disposition: errors.length ? 'revise' : 'approved-for-queue' },
    assumptions: ['No commerce publication occurs without an external provider receipt'],
    uncertainty: { commerceAccountsConnected: false, humanApprovalRequired: true } };
}

export { evaluate };
