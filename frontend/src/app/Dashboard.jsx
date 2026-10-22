import { useEffect, useRef, useState } from 'react';
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
  CalendarDays,
  Trophy,
  X,
} from 'lucide-react';
import {
  AnalysisPage,
  OverviewPage,
  MatchesPage,
  StandingsPage,
  StatisticsPage,
} from '../features/analytics/presentation/CollectivePages.jsx';
import { ComparisonPage } from '../features/analytics/presentation/ComparisonPage.jsx';
import {
  MethodologyPage,
  NotFoundPage,
  PowerBiPage,
} from '../features/analytics/presentation/CollectiveDocumentation.jsx';
import { AnalyticsContext } from '../features/analytics/presentation/analytics-hooks.js';
import { SportsIcon } from '../features/analytics/presentation/SportsIcon.jsx';
import { useCompactNavigation } from './use-compact-navigation.js';
import { Brand } from '../features/identity/presentation/Brand.jsx';
import { ThemeToggle } from '../features/appearance/presentation/ThemeToggle.jsx';

const navigation = [
  ['/', 'Visão geral', LayoutDashboard],
  ['/partidas', 'Partidas', CalendarDays],
  ['/classificacao', 'Classificação', Trophy],
  ['/comparar', 'Comparar', GitCompareArrows],
  ['/ofensivo', 'Análise ofensiva', Target],
  ['/defensivo', 'Análise defensiva', ShieldCheck],
  ['/estatisticas', 'Estatística', ChartNoAxesCombined],
  ['/power-bi', 'Power BI', BarChart3],
  ['/metodologia', 'Metodologia', BookOpen],
];
export function Dashboard({ loadAnalytics, basePath = '' }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const compact = useCompactNavigation();
  const location = useLocation();
  const menuButton = useRef(null);
  const closeButton = useRef(null);
  const previousPath = useRef(location.pathname);
  useEffect(() => {
    if (previousPath.current !== location.pathname) {
      document.getElementById('main')?.focus();
      window.scrollTo?.({ top: 0, behavior: 'instant' });
      previousPath.current = location.pathname;
    }
  }, [location.pathname]);
  useEffect(() => {
    if (!mobileOpen || !compact) return;
    closeButton.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event) => {
      if (event.key === 'Escape') {
        setMobileOpen(false);
        menuButton.current?.focus();
      }
      if (event.key === 'Tab') {
        const items = [
          ...document.querySelectorAll(
            '#primary-navigation button, #primary-navigation a',
          ),
        ];
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, compact]);
  const relativePath = location.pathname.slice(basePath.length) || '/';
  const page = navigation.find(([path]) =>
    path === '/' ? relativePath === '/' : relativePath.startsWith(path),
  );
  return (
    <AnalyticsContext.Provider value={loadAnalytics}>
      <a className="skip-link" href="#main">
        Pular para o conteúdo
      </a>
      {mobileOpen && compact && (
        <button
          className="menu-scrim"
          aria-label="Fechar menu"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside
        id="primary-navigation"
        role={compact && mobileOpen ? 'dialog' : undefined}
        aria-modal={compact && mobileOpen ? true : undefined}
        inert={compact && !mobileOpen}
        className={`sidebar ${mobileOpen ? 'open' : ''}`}
        aria-label="Menu principal"
      >
        <div className="brand">
          <button
            className="icon-button mobile-close"
            ref={closeButton}
            aria-label="Fechar navegação"
            onClick={() => {
              setMobileOpen(false);
              menuButton.current?.focus();
            }}
          >
            <X size={20} />
          </button>
          <Brand compact />
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
              to={`${basePath}${path === '/' ? '' : path}` || '/'}
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
              ref={menuButton}
              aria-label="Abrir navegação"
              aria-expanded={mobileOpen}
              aria-controls="primary-navigation"
              onClick={() => setMobileOpen(true)}
            >
              <Menu size={21} />
            </button>
            <PanelLeftClose className="desktop-indicator" size={18} />
            <span className="breadcrumb">
              MengoData <ChevronRight size={13} />
              <strong>{page?.[1] ?? 'Perfil'}</strong>
            </span>
          </div>
          <div className="topbar-actions">
            <span className="header-scope">
              <span className="red-dot" />
              Temporada completa <span className="year">2025</span>
            </span>
            <ThemeToggle />
          </div>
        </header>
        <main id="main" tabIndex={-1}>
          <Routes>
            <Route index element={<OverviewPage />} />
            <Route path="partidas" element={<MatchesPage />} />
            <Route path="classificacao" element={<StandingsPage />} />
            <Route path="comparar" element={<ComparisonPage />} />
            <Route
              path="ofensivo"
              element={<AnalysisPage key="offensive" kind="offensive" />}
            />
            <Route
              path="defensivo"
              element={<AnalysisPage key="defensive" kind="defensive" />}
            />
            <Route path="estatisticas" element={<StatisticsPage />} />
            <Route path="power-bi" element={<PowerBiPage />} />
            <Route path="metodologia" element={<MethodologyPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer>
          <span>
            MengoData <span className="footer-divider">/</span> Projeto acadêmico
            independente
          </span>
          <NavLink to={`${basePath}/metodologia`}>
            Fontes e metodologia <ArrowUpRight size={13} />
          </NavLink>
        </footer>
      </div>
    </AnalyticsContext.Provider>
  );
}
