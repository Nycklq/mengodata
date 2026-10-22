import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import { loadAnalytics } from '../features/analytics/application/load-analytics.js';
import { createHttpAnalyticsGateway } from '../features/analytics/infrastructure/http-analytics-gateway.js';
import { createBrowserAppearance } from '../features/appearance/infrastructure/browser-appearance.js';
import { AppearanceProvider } from '../features/appearance/presentation/AppearanceProvider.jsx';
import { Application } from './Application.jsx';
import '@fontsource/poppins/latin-400.css';
import '@fontsource/poppins/latin-500.css';
import '@fontsource/poppins/latin-600.css';
import '@fontsource/poppins/latin-700.css';
import '@fontsource/poppins/latin-500-italic.css';
import './design-system.css';

const gateway = createHttpAnalyticsGateway();
const queryClient = new QueryClient();
const appearance = createBrowserAppearance();
const load = (resource, filters, signal) =>
  loadAnalytics(gateway, resource, filters, signal);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppearanceProvider gateway={appearance}>
        <BrowserRouter>
          <Application loadAnalytics={load} />
        </BrowserRouter>
      </AppearanceProvider>
    </QueryClientProvider>
  </StrictMode>,
);
