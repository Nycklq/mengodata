export function createCachedCollectiveRepository(
  repository,
  { ttlMs = 1000, now = Date.now } = {},
) {
  let cached;
  let hasCached = false;
  let expiresAt = 0;
  let pending;

  return {
    read() {
      if (hasCached && now() < expiresAt) return Promise.resolve(cached);
      if (!pending) {
        pending = Promise.resolve()
          .then(() => repository.read())
          .then((snapshot) => {
            cached = snapshot;
            hasCached = true;
            expiresAt = now() + ttlMs;
            return snapshot;
          })
          .finally(() => {
            pending = undefined;
          });
      }
      return pending;
    },
  };
}
