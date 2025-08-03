import { neon, neonConfig } from '@neondatabase/serverless';

// Optional: Set the WebSocket proxy to work around corporate firewalls
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(neonConfig as any).webSocketProxy = (host: string) => {
  return `wss://proxy.neon.tech/v2?host=${host}`;
};

// Use the environment variable for the connection string
export const sql = neon(process.env.DATABASE_URL!);

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