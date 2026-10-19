import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { loadAnalytics } from '../features/analytics/application/load-analytics.js';
import { createHttpAnalyticsGateway } from '../features/analytics/infrastructure/http-analytics-gateway.js';
import { Dashboard } from './Dashboard.jsx';
import './styles.css';

const gateway = createHttpAnalyticsGateway();
const queryClient = new QueryClient();
const load = (resource, filters, signal) =>
  loadAnalytics(gateway, resource, filters, signal);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Dashboard loadAnalytics={load} />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
