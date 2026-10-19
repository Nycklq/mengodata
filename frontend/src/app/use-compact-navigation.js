import { useSyncExternalStore } from 'react';

function subscribe(listener) {
  const query = window.matchMedia?.('(max-width: 720px)');
  query?.addEventListener('change', listener);
  return () => query?.removeEventListener('change', listener);
}
function snapshot() {
  return window.matchMedia?.('(max-width: 720px)').matches ?? false;
}
export function useCompactNavigation() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
