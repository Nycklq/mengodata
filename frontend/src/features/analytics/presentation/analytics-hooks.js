import { createContext, useContext } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';

export const AnalyticsContext = createContext(null);
export function useAnalytics(resource, filters = {}, enabled = true) {
  const load = useContext(AnalyticsContext);
  return useQuery({
    queryKey: ['analytics', resource, filters],
    queryFn: ({ signal }) => load(resource, filters, signal),
    staleTime: 60000,
    retry: 1,
    enabled,
  });
}
export function useFilters() {
  const [parameters, setParameters] = useSearchParams();
  const update = (key, selected) =>
    setParameters((previous) => {
      const next = new URLSearchParams(previous);
      if (selected) next.set(key, selected);
      else next.delete(key);
      if (key !== 'page') next.delete('page');
      return next;
    });
  return { parameters, update };
}
