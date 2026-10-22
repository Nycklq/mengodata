import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnalyticsContext } from '../features/analytics/presentation/analytics-hooks.js';
import { NotFoundPage } from '../features/analytics/presentation/CollectiveDocumentation.jsx';
import { LandingPage } from '../features/landing/presentation/LandingPage.jsx';
import { Brand } from '../features/identity/presentation/Brand.jsx';
import { ThemeToggle } from '../features/appearance/presentation/ThemeToggle.jsx';
import { Dashboard } from './Dashboard.jsx';
import { usePageNavigation } from './use-page-navigation.js';

function LegacyRedirect() {
  const location = useLocation();
  return (
    <Navigate
      replace
      to={`/dashboard${location.pathname}${location.search}${location.hash}`}
    />
  );
}

export function Application({ loadAnalytics }) {
  usePageNavigation();
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AnalyticsContext.Provider value={loadAnalytics}>
            <LandingPage />
          </AnalyticsContext.Provider>
        }
      />
      <Route
        path="/dashboard/*"
        element={<Dashboard loadAnalytics={loadAnalytics} basePath="/dashboard" />}
      />
      {[
        'partidas',
        'classificacao',
        'comparar',
        'ofensivo',
        'defensivo',
        'estatisticas',
        'power-bi',
        'metodologia',
      ].map((path) => (
        <Route key={path} path={`/${path}`} element={<LegacyRedirect />} />
      ))}
      <Route
        path="*"
        element={
          <div className="public-not-found">
            <header>
              <Brand />
              <ThemeToggle />
            </header>
            <NotFoundPage />
          </div>
        }
      />
    </Routes>
  );
}
