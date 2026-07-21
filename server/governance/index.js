import pg from 'pg';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { createRouter } from './router.js';
import { postgres } from './store.js';
import { evaluate } from './domain.js';

const { Pool } = pg;
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)) });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function auth(req, res, next) {
  const secret = process.env.JWT_SECRET || '';
  const token = req.headers.authorization && req.headers.authorization.match(/^Bearer (.+)$/)?.[1];
  if (secret.length < 32) return res.status(503).json({ error: 'secure JWT configuration required' });
  if (!token) return res.status(401).json({ error: 'bearer token required' });
  try { req.user = jwt.verify(token, secret, { algorithms: ['HS256'] }); }
  catch (_) { return res.status(401).json({ error: 'invalid token' }); }
  next();
}

export default createRouter({
  db: postgres(pool),
  auth,
  evaluate,
  workflow: 'virtual-showroom-publication',
  providers: ["ecommerce-platform","pos","inventory","catalog","media-storage","cms","analytics","notification","webhook"],
  approverRoles: ["showroom_reviewer","commerce_reviewer","privacy_officer","admin"]
});
