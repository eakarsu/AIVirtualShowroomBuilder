# Virtual Showroom Builder operations

## Supported boundary

The governed path covers a tenant-scoped showroom project, versioned catalog/inventory/price/rights inputs, accessible layout validation, independent publication approval, provider queueing, receipts, reconciliation, and rollback/manual recovery. The e-commerce, POS, inventory, catalog, media, CMS, analytics, notification, and webhook names are typed adapter contracts—not claims that live accounts are connected. Outbound publication must remain disabled until each configured adapter passes sandbox contract and receipt-reconciliation tests.

Generated feature routes are disabled by default and cannot be enabled in production. No model output autonomously publishes a showroom or changes price or inventory.

## Deploy and run

Install dependencies explicitly in the root and `client/`. Copy `.env.example` to `.env`, set `DATABASE_URL`, a deployment-unique `GOVERNANCE_TENANT_ID`, and a random `JWT_SECRET` of at least 32 characters. Keep provider credentials in a secret manager; workflow payloads contain references only.

Run `./start.sh check`. Review the SQL and take a backup, then use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`. Migration is never performed during application startup. Start with `./start.sh start`; it owns and stops only its two child processes.

## Workflow and recovery

Create a subject-scoped item at `/api/governance` with `Idempotency-Key` and complete provenance, submit the current version, and obtain a decision from an authorized reviewer other than the creator. Queue only allow-listed operations from an approved item. Workers use leases, reuse provider idempotency keys, and persist typed receipts. Stale catalog data, inventory conflict, webhook retry, or publication failure stops execution; reconcile the authoritative source and resume or retire the same durable item. Never create a second publication to work around an ambiguous receipt.

Run `node --test server/governance/tests/*.test.js` and `bash -n start.sh`. Destructive fixtures are isolated from startup and require `ALLOW_DESTRUCTIVE_SEED=true`, `SEED_ADMIN_EMAIL`, and `SEED_ADMIN_PASSWORD` against a disposable database.
