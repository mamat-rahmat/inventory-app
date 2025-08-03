import { neon, neonConfig } from '@neondatabase/serverless';

// Optional: Set the WebSocket proxy to work around corporate firewalls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(neonConfig as any).webSocketProxy = (host: string) => {
  return `wss://proxy.neon.tech/v2?host=${host}`;
};

// In a real application, you would use an environment variable for the connection string
// export const sql = neon(process.env.DATABASE_URL!);

// For development purposes, we'll use a placeholder
export const sql = neon('postgresql://user:password@localhost:5432/inventory');

// Example query function
export async function executeQuery(query: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await (sql as any)(query);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}