export function readNeonConnection(environment = process.env) {
  const value = environment.NEON_DATABASE_URL;
  if (!value) throw new Error('NEON_DATABASE_URL_REQUIRED');
  let target;
  try {
    target = new URL(value);
  } catch {
    throw new Error('INVALID_NEON_DATABASE_URL');
  }
  if (
    !['postgres:', 'postgresql:'].includes(target.protocol) ||
    !target.hostname.endsWith('.neon.tech') ||
    !target.username ||
    !target.password ||
    [...target.searchParams.keys()].some(
      (key) => !['sslmode', 'channel_binding'].includes(key),
    ) ||
    target.pathname.length < 2 ||
    (target.port && target.port !== '5432')
  )
    throw new Error('INVALID_NEON_DATABASE_URL');
  if (target.hostname.split('.')[0].endsWith('-pooler'))
    throw new Error('NEON_DIRECT_CONNECTION_REQUIRED');
  return value;
}
