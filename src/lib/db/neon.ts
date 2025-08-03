import { Pool, PoolClient } from 'pg';

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false
  },
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Template literal function for SQL queries (similar to neon's sql``)
export function sql(strings: TemplateStringsArray, ...values: unknown[]) {
  let query = '';
  const params: unknown[] = [];
  
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < values.length) {
      params.push(values[i]);
      query += `$${params.length}`;
    }
  }
  
  return pool.query(query, params);
}

// Direct query function
export async function executeQuery(query: string, params?: unknown[]) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get a client from the pool for transactions
export async function getClient(): Promise<PoolClient> {
  return await pool.connect();
}

// Close the pool (for cleanup)
export async function closePool() {
  await pool.end();
}