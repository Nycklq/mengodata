import pg from 'pg';

export function createPostgresPool(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL_REQUIRED');
  return new pg.Pool({
    connectionString,
    application_name: `flamengo-analytics:${process.pid}`,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 5000,
    max: 4,
  });
}
