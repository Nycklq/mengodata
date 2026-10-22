export function normalizeApiOrigin(value = '') {
  if (!value) return '';
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new Error('INVALID_API_ORIGIN');
  }
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    (url.protocol === 'http:' &&
      !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) ||
    url.username ||
    url.password ||
    url.pathname !== '/' ||
    url.search ||
    url.hash
  )
    throw new Error('INVALID_API_ORIGIN');
  return url.origin;
}
