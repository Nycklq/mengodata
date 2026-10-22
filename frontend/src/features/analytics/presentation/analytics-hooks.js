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
  const updateMany = (changes) =>
    setParameters((previous) => {
      const next = new URLSearchParams(previous);
      for (const [key, selected] of Object.entries(changes)) {
        if (selected) next.set(key, selected);
        else next.delete(key);
      }
      if (!Object.hasOwn(changes, 'page')) next.delete('page');
      return next;
    });
  const update = (key, selected) => updateMany({ [key]: selected });
  return { parameters, update, updateMany };
}
