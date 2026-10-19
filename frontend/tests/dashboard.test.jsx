import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../src/app/Dashboard.jsx';
import { loadAnalytics } from '../src/features/analytics/application/load-analytics.js';
import { createHttpAnalyticsGateway } from '../src/features/analytics/infrastructure/http-analytics-gateway.js';
import { SportsIcon } from '../src/features/analytics/presentation/SportsIcon.jsx';
import { createAnalyticsService } from '../../backend/src/application/get-analytics.js';
import { syntheticSnapshot } from '../../backend/tests/analytics-fixture.js';

function renderDashboard(
  path = '/',
  snapshot = { ...syntheticSnapshot(), availability: 'unavailable' },
  loader,
) {
  const service = createAnalyticsService({ read: async () => snapshot });
  const load =
    loader ??
    ((resource, filters) =>
      service(
        {
          'rankings/contributions': 'contributions',
          'analytics/offensive': 'offensive',
          'analytics/defensive': 'defensive',
          'analytics/distribution': 'distribution',
          'data-quality': 'data-quality',
        }[resource] ?? (resource.startsWith('players/') ? 'player' : resource),
        {
          ...filters,
          min_minutes: Number(filters.min_minutes ?? 0),
          ids: typeof filters.ids === 'string' ? filters.ids.split(',') : filters.ids,
          player_id: resource.startsWith('players/')
            ? resource.split('/')[1]
            : undefined,
        },
      ));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, retryDelay: 0, gcTime: 0 } },
  });
  return {
    load,
    ...render(
      <QueryClientProvider client={client}>
        <MemoryRouter initialEntries={[path]}>
          <Dashboard loadAnalytics={load} />
        </MemoryRouter>
      </QueryClientProvider>,
    ),
  };
}

describe('integrated dashboard with synthetic fixtures confined to tests', () => {
  it('shows honest unavailable cards, SVGs and functional navigation', async () => {
    renderDashboard();
    expect(
      await screen.findByText('Estatísticas individuais aguardam homologação'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('Indisponível')).toHaveLength(4);
    expect(screen.queryByText('Synthetic Alpha')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Jogadores' }));
    expect(
      await screen.findByRole('heading', { name: 'Jogadores', level: 1 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByText('Elenco estatístico indisponível'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'CSV bloqueado' })).toBeDisabled();
  });
  it.each([
    ['/comparar', 'Comparar jogadores'],
    ['/ofensivo', 'Análise ofensiva'],
    ['/defensivo', 'Análise defensiva'],
    ['/estatisticas', 'Estatística descritiva'],
    ['/power-bi', 'Power BI'],
    ['/metodologia', 'Metodologia e fontes'],
    ['/jogadores/00000000-0000-4000-8000-000000000001', 'Perfil do jogador'],
  ])('renders route %s', async (path, title) => {
    renderDashboard(path);
    expect(
      await screen.findByRole('heading', { name: title, level: 1 }),
    ).toBeInTheDocument();
  });
  it('search, position and custom minutes alter the displayed table', async () => {
    renderDashboard('/jogadores', syntheticSnapshot());
    expect(
      await screen.findByRole('link', { name: 'Synthetic Alpha' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Synthetic Beta' })).toBeInTheDocument();
    fireEvent.change(screen.getByRole('textbox', { name: 'Buscar jogador' }), {
      target: { value: 'Alpha' },
    });
    await waitFor(() =>
      expect(
        screen.queryByRole('link', { name: 'Synthetic Beta' }),
      ).not.toBeInTheDocument(),
    );
    fireEvent.change(
      screen.getByRole('spinbutton', { name: 'Minutos personalizados' }),
      { target: { value: '900' } },
    );
    expect(await screen.findByText('Nenhum jogador encontrado')).toBeInTheDocument();
  });
  it('comparison requires distinct players and shows position context with null-safe differences', async () => {
    const snapshot = syntheticSnapshot('partial');
    renderDashboard('/comparar', snapshot);
    const first = await screen.findByRole('combobox', { name: 'Primeiro jogador' });
    fireEvent.change(first, { target: { value: snapshot.players[0].player_id } });
    fireEvent.change(screen.getByRole('combobox', { name: 'Segundo jogador' }), {
      target: { value: snapshot.players[0].player_id },
    });
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'dois jogadores diferentes',
    );
    fireEvent.change(screen.getByRole('combobox', { name: 'Segundo jogador' }), {
      target: { value: snapshot.players[1].player_id },
    });
    expect(await screen.findByText(/Posições diferentes/)).toBeInTheDocument();
    expect(
      await screen.findByText('Diferença: primeiro − segundo'),
    ).toBeInTheDocument();
    expect(screen.getByText('Cobertura parcial')).toBeInTheDocument();
  });
  it('loading and network recovery stay actionable', async () => {
    let fail = true;
    const actual = createAnalyticsService({
      read: async () => ({ ...syntheticSnapshot(), availability: 'unavailable' }),
    });
    renderDashboard('/jogadores', undefined, async (...args) => {
      if (fail) throw new Error('synthetic-network');
      return actual(...args);
    });
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
    fail = false;
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(
      await screen.findByText('Elenco estatístico indisponível'),
    ).toBeInTheDocument();
  });
  it('renders a pending request and mobile navigation controls', () => {
    renderDashboard('/jogadores', undefined, () => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
    const open = screen.getByRole('button', { name: 'Abrir navegação' });
    fireEvent.click(open);
    expect(open).toHaveAttribute('aria-expanded', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Fechar navegação' }));
    expect(open).toHaveAttribute('aria-expanded', 'false');
  });
  it('uses distinct decorative vector shapes', () => {
    const shapes = [
      'ball',
      'shirt',
      'pitch',
      'boot',
      'trophy',
      'target',
      'shield',
      'whistle',
      'chart',
    ].map((kind) => {
      const { container, unmount } = render(<SportsIcon kind={kind} />);
      const svg = container.querySelector('svg');
      expect(svg).toHaveAttribute('aria-hidden', 'true');
      const markup = svg.innerHTML;
      unmount();
      return markup;
    });
    expect(new Set(shapes).size).toBe(9);
  });
});

describe('analytics gateway and scope boundary', () => {
  it('rejects scope overrides and preserves transport cancellation', async () => {
    const snapshot = await createAnalyticsService({
      read: async () => syntheticSnapshot(),
    })('players');
    const fetchRequest = vi.fn(async () => Response.json(snapshot));
    const gateway = createHttpAnalyticsGateway(fetchRequest);
    const controller = new AbortController();
    await loadAnalytics(
      gateway,
      'players',
      { q: 'Alpha', position: '' },
      controller.signal,
    );
    expect(fetchRequest).toHaveBeenCalledWith('/api/players?q=Alpha', {
      signal: controller.signal,
    });
    snapshot.scope = { ...snapshot.scope, season: 2026 };
    await expect(loadAnalytics(gateway, 'players', {})).rejects.toThrow(
      'ANALYTICS_SCOPE_MISMATCH',
    );
  });
});
