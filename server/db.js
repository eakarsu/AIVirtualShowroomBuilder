import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'ai_showroom',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

// Ensure ai_results table exists
pool.query(`
  CREATE TABLE IF NOT EXISTS ai_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    endpoint VARCHAR(255),
    input_data JSONB,
    result JSONB,
    created_at TIMESTAMP DEFAULT NOW()
  )
`).catch(err => console.error('ai_results table init error:', err.message));

export default pool;
