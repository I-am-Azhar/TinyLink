import { Pool } from 'pg';
import type { QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Please configure it in your environment.');
}

declare global {
  var __tinylink_pool__: Pool | undefined;
}

const pool = global.__tinylink_pool__ ?? new Pool({ connectionString });

if (process.env.NODE_ENV !== 'production') {
  global.__tinylink_pool__ = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(text: string, params?: unknown[]) {
  return pool.query<T>(text, params);
}

export { pool };

