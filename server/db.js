import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });
const { Pool } = pg;

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');

// Schema changes are performed only by the explicit migration command.
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export default pool;
