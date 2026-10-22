import { readFileSync } from 'node:fs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Application } from '../src/app/Application.jsx';
import { AppearanceProvider } from '../src/features/appearance/presentation/AppearanceProvider.jsx';
import { createBrowserAppearance } from '../src/features/appearance/infrastructure/browser-appearance.js';
import {
  seasonComparison,
  seasonPreview,
} from '../src/features/landing/domain/season-preview.js';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';

vi.mock('../src/features/analytics/presentation/CollectivePlot.jsx', () => ({
  default: () => <div role="img" aria-label="Prévia dos dados" />,
}));
const snapshot = JSON.parse(readFileSync('../data/analytics/collective.json', 'utf8'));
const service = createCollectiveService({ read: async () => snapshot });
const loader = (resource, filters = {}) =>
  service(
    resource.replace('analytics/', ''),
    Object.fromEntries(
      Object.entries(filters).map(([key, value]) => [
        key,
        ['from_round', 'to_round'].includes(key) ? Number(value) : value,
      ]),
    ),
  );
function Location() {
  const location = useLocation();
  return (
    <output aria-label="Endereço atual">
      {location.pathname + location.search + location.hash}
    </output>
  );
}
function mount(path = '/', loadAnalytics = loader) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <AppearanceProvider gateway={createBrowserAppearance()}>
        <MemoryRouter initialEntries={[path]}>
          <Application loadAnalytics={loadAnalytics} />
          <Location />
        </MemoryRouter>
      </AppearanceProvider>
    </QueryClientProvider>,
  );
}

describe('landing pública e navegação MengoData', () => {
  it('mostra cobertura verificada, comparação real e abre o dashboard sem autenticação', async () => {
    mount();
    expect(
      screen.getByRole('heading', { level: 1, name: /O jogo muda.*Os dados revelam/ }),
    ).toBeInTheDocument();
    expect(await screen.findByText('380')).toBeInTheDocument();
    expect(screen.getByText('Rodadas oficiais').parentElement).toHaveTextContent('38');
    expect(
      screen.queryByRole('link', { name: /login|cadastro|sign up/i }),
    ).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Comparar Flamengo com'), {
      target: { value: 'club:bahia' },
    });
    await waitFor(() =>
      expect(screen.getByRole('link', { name: 'Comparar campanhas' })).toHaveAttribute(
        'href',
        expect.stringContaining('opponent_id=club%3Abahia'),
      ),
    );
    fireEvent.click(
      within(screen.getByRole('region', { name: /O jogo muda/ })).getByRole('link', {
        name: 'Explorar dashboard',
      }),
    );
    expect(
      await screen.findByRole('heading', {
        level: 1,
        name: /Uma temporada.*Muitas perspectivas/,
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Endereço atual')).toHaveTextContent('/dashboard');
    expect(screen.getByRole('link', { name: 'Visão geral' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });
  it('preserva filtros e âncora dos links antigos', async () => {
    mount(
      '/comparar?club_id=club%3Abahia&opponent_id=club%3Avitoria&to_round=20#tendencia',
    );
    expect(
      await screen.findByRole('heading', { name: 'Comparar clubes' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Endereço atual')).toHaveTextContent(
      '/dashboard/comparar?club_id=club%3Abahia&opponent_id=club%3Avitoria&to_round=20#tendencia',
    );
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Clube de referência' })).toHaveValue(
        'club:bahia',
      ),
    );
  });
  it.each([
    ['partidas', 'Partidas'],
    ['classificacao', 'Classificação calculada'],
    ['comparar', 'Comparar clubes'],
    ['ofensivo', 'Análise ofensiva'],
    ['defensivo', 'Análise defensiva'],
    ['estatisticas', 'Estatística descritiva'],
    ['power-bi', 'Power BI'],
    ['metodologia', 'Metodologia e fontes'],
  ])('abre rota canônica %s', async (path, title) => {
    mount('/dashboard/' + path);
    expect(
      await screen.findByRole('heading', { level: 1, name: title }),
    ).toBeInTheDocument();
  });
  it('mantém o tema da landing ao navegar para o dashboard e voltar', async () => {
    localStorage.clear();
    mount();
    fireEvent.click(screen.getByRole('button', { name: 'Ativar modo escuro' }));
    fireEvent.click(screen.getByRole('link', { name: 'Abrir dashboard' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /Uma temporada/ }),
    ).toBeInTheDocument();
    expect(document.documentElement.dataset.theme).toBe('dark');
    fireEvent.click(screen.getByRole('link', { name: 'MengoData — página inicial' }));
    expect(
      await screen.findByRole('heading', { level: 1, name: /O jogo muda/ }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Ativar modo claro' }),
    ).toBeInTheDocument();
  });
  it('abre o menu público e devolve o foco com Escape', () => {
    mount();
    const button = screen.getByRole('button', { name: 'Abrir menu da página inicial' });
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(
      within(
        screen.getByRole('navigation', { name: 'Navegação da página inicial' }),
      ).getByRole('link', { name: 'Projeto' }),
    ).toHaveFocus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveFocus();
  });
  it('mantém o CTA funcional quando a base está indisponível e não inventa cobertura', async () => {
    mount('/', async () => ({ availability: 'unavailable', data: null }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Dados indisponíveis');
    expect(screen.queryByText('380')).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    expect(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    ).toBeInTheDocument();
  });
  it('não usa dados de outro recorte nem cobertura parcial na prévia', async () => {
    const summary = await service('summary');
    expect(seasonPreview(summary).available).toBe(true);
    expect(
      seasonPreview({ ...summary, scope: { ...summary.scope, season: 2026 } })
        .available,
    ).toBe(false);
    expect(
      seasonPreview({
        ...summary,
        scope: { ...summary.scope, competition_id: 'other' },
      }).available,
    ).toBe(false);
    expect(
      seasonPreview({ ...summary, coverage: { ...summary.coverage, matches: 379 } })
        .club,
    ).toBeNull();
    expect(seasonPreview(undefined).coverage).toBeNull();
    const comparison = await service('compare');
    expect(seasonComparison(summary, comparison)).toHaveLength(2);
    expect(
      seasonComparison(summary, { ...comparison, dataset_version: 'other' }),
    ).toEqual([]);
    expect(
      seasonComparison({ ...summary, availability: 'unavailable' }, comparison),
    ).toEqual([]);
  });
  it('oferece recuperação em endereço inexistente', () => {
    mount('/nao-existe');
    expect(
      screen.getByRole('heading', { name: 'Página não encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
  });
});
