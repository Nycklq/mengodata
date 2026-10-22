import pg from 'pg';

export function postgresConnectionOptions(connectionString) {
  if (!connectionString) throw new Error('DATABASE_URL_REQUIRED');
  let target;
  try {
    target = new URL(connectionString);
  } catch {
    throw new Error('INVALID_DATABASE_URL');
  }
  if (
    !['postgres:', 'postgresql:'].includes(target.protocol) ||
    !target.hostname ||
    target.pathname.length < 2
  )
    throw new Error('INVALID_DATABASE_URL');
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname);
  const options = {
    connectionString,
    application_name: `flamengo-analytics:${process.pid}`,
    connectionTimeoutMillis: local ? 5000 : 15000,
    idleTimeoutMillis: 5000,
    max: 4,
  };
  if (local) return options;
  const mode = target.searchParams.get('sslmode');
  if (mode && !['require', 'verify-ca', 'verify-full'].includes(mode))
    throw new Error('DATABASE_TLS_REQUIRED');
  if (
    [...target.searchParams.keys()].some(
      (key) => !['sslmode', 'channel_binding'].includes(key),
    )
  )
    throw new Error('INVALID_DATABASE_TLS_CONFIGURATION');
  const channelBinding = target.searchParams.get('channel_binding');
  if (channelBinding && !['prefer', 'require'].includes(channelBinding))
    throw new Error('INVALID_DATABASE_TLS_CONFIGURATION');
  target.searchParams.delete('sslmode');
  target.searchParams.delete('channel_binding');
  return {
    ...options,
    connectionString: target.href,
    ssl: { rejectUnauthorized: true },
    enableChannelBinding: true,
  };
}

export function createPostgresPool(connectionString) {
  return new pg.Pool(postgresConnectionOptions(connectionString));
}
