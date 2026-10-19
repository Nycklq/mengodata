import { useState } from 'react';
import { NavLink, Route, Routes, useLocation } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  ChartNoAxesCombined,
  ChevronRight,
  GitCompareArrows,
  LayoutDashboard,
  Menu,
  PanelLeftClose,
  ShieldCheck,
  Target,
  Users,
  X,
} from 'lucide-react';
import {
  AnalysisPage,
  ComparisonPage,
  OverviewPage,
  PlayersPage,
  ProfilePage,
  StatisticsPage,
} from '../features/analytics/presentation/AnalyticsPages.jsx';
import {
  MethodologyPage,
  NotFoundPage,
  PowerBiPage,
} from '../features/analytics/presentation/DocumentationPages.jsx';
import { AnalyticsContext } from '../features/analytics/presentation/analytics-hooks.js';
import { SportsIcon } from '../features/analytics/presentation/SportsIcon.jsx';
import { useCompactNavigation } from './use-compact-navigation.js';

const navigation = [
  ['/', 'Visão geral', LayoutDashboard],
  ['/jogadores', 'Jogadores', Users],
  ['/comparar', 'Comparar', GitCompareArrows],
  ['/ofensivo', 'Análise ofensiva', Target],
  ['/defensivo', 'Análise defensiva', ShieldCheck],
  ['/estatisticas', 'Estatística', ChartNoAxesCombined],
  ['/power-bi', 'Power BI', BarChart3],
  ['/metodologia', 'Metodologia', BookOpen],
];
export function Dashboard({ loadAnalytics }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const compact = useCompactNavigation();
  const location = useLocation();
  const page = navigation.find(([path]) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path),
  );
  return (
    <AnalyticsContext.Provider value={loadAnalytics}>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      {mobileOpen && (
        <button
          className="menu-scrim"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="primary-navigation"
        inert={compact && !mobileOpen}
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        aria-label="Menu principal"
      >
        <div className="brand">
          <span className="brand-mark">
            <SportsIcon kind="shield" size={31} />
          </span>
          <span>
            FLAMENGO<small>ANALYTICS</small>
          </span>
          <button
            className="icon-button mobile-close"
            aria-label="Fechar navegação"
            onClick={() => setMobileOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="season-tag">
          <span className="red-dot" />
          BRASILEIRÃO · 2025
        </div>
        <p className="nav-label">EXPLORAR</p>
        <nav>
          {navigation.map(([path, label, Icon]) => (
            <NavLink
              key={path}
              to={path}
              end={path === '/'}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={19} />
              <span>{label}</span>
              <ChevronRight size={14} />
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <SportsIcon kind="pitch" size={38} />
          <strong>Dados com contexto.</strong>
          <p>Clareza para entender o jogo.</p>
          <span>RODADAS OFICIAIS 1—38</span>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <button
              className="icon-button mobile-menu"
              aria-label="Abrir navegação"
              aria-expanded={mobileOpen}
              aria-controls="primary-navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <PanelLeftClose className="desktop-indicator" size={18} />
            <span className="breadcrumb">
              Flamengo Analytics <ChevronRight size={13} />
              <strong>{page?.[1] ?? 'Perfil'}</strong>
            </span>
          </div>
          <span className="header-scope">
            <span className="red-dot" />
            Temporada completa <span className="year">2025</span>
          </span>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route path="/" element={<OverviewPage />} />
            <Route path="/jogadores" element={<PlayersPage />} />
            <Route path="/jogadores/:id" element={<ProfilePage />} />
            <Route path="/comparar" element={<ComparisonPage />} />
            <Route
              path="/ofensivo"
              element={<AnalysisPage key="offensive" kind="offensive" />}
            />
            <Route
              path="/defensivo"
              element={<AnalysisPage key="defensive" kind="defensive" />}
            />
            <Route path="/estatisticas" element={<StatisticsPage />} />
            <Route path="/power-bi" element={<PowerBiPage />} />
            <Route path="/metodologia" element={<MethodologyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer>
          <span>
            Flamengo Analytics <span className="footer-divider">/</span> Projeto
            acadêmico independente
          </span>
          <NavLink to="/metodologia">
            Fontes e metodologia <ArrowUpRight size={13} />
          </NavLink>
        </footer>
      </div>
    </AnalyticsContext.Provider>
  );
}
