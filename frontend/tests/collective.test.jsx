import { readFileSync } from 'node:fs';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { Dashboard } from '../src/app/Dashboard.jsx';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';

vi.mock('../src/features/analytics/presentation/CollectivePlot.jsx', () => ({
  default: () => <div role="img" aria-label="Gráfico real" />,
}));
const document = JSON.parse(readFileSync('../data/analytics/collective.json', 'utf8'));
function mount(path = '/', load) {
  const service = createCollectiveService({ read: async () => document });
  const loader =
    load ??
    ((resource, filters) =>
      service(
        resource.replace('analytics/', ''),
        Object.fromEntries(
          Object.entries(filters ?? {}).map(([key, value]) => [
            key,
            ['from_round', 'to_round', 'page', 'page_size'].includes(key)
              ? Number(value)
              : value,
          ]),
        ),
      ));
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={[path]}>
        <Dashboard loadAnalytics={loader} />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}
describe('dashboard coletivo com resultados reais', () => {
  it('exibe totais reais e navegação sem jogadores', async () => {
    mount();
    expect(
      await screen.findByText('380 partidas verificadas · 38 rodadas · 20 clubes'),
    ).toBeInTheDocument();
    expect(screen.getAllByText('79').length).toBeGreaterThan(0);
    expect(screen.queryByRole('link', { name: 'Jogadores' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Partidas' }));
    expect(
      await screen.findByRole('heading', { name: 'Partidas', level: 1 }),
    ).toBeInTheDocument();
    expect(await screen.findByText('38 partidas no recorte')).toBeInTheDocument();
  });
  it.each([
    ['/classificacao', 'Classificação calculada'],
    ['/comparar', 'Comparar clubes'],
    ['/ofensivo', 'Análise ofensiva'],
    ['/defensivo', 'Análise defensiva'],
    ['/estatisticas', 'Estatística descritiva'],
    ['/metodologia', 'Metodologia e fontes'],
    ['/power-bi', 'Power BI'],
  ])('abre página %s', async (path, title) => {
    mount(path);
    expect(
      await screen.findByRole('heading', { name: title, level: 1 }),
    ).toBeInTheDocument();
  });
  it('preserva filtros no CSV, pagina e apresenta vazio', async () => {
    mount('/partidas');
    expect(await screen.findByText('38 partidas no recorte')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Próxima' }));
    expect(await screen.findByText('Página 2 · 38 resultados')).toBeInTheDocument();
    fireEvent.change(screen.getByRole('combobox', { name: 'Adversário' }), {
      target: { value: 'club:sport' },
    });
    fireEvent.change(screen.getByRole('combobox', { name: 'Resultado do clube' }), {
      target: { value: 'L' },
    });
    expect(
      await screen.findByText('Nenhuma partida para estes filtros.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Exportar CSV' })).toHaveAttribute(
      'href',
      expect.stringContaining('opponent_id=club%3Asport'),
    );
  });
  it('altera o adversário comparado e usa a rodada escolhida', async () => {
    mount('/comparar');
    const select = await screen.findByRole('combobox', { name: 'Clube para comparar' });
    await waitFor(() => expect(select.options.length).toBe(19));
    fireEvent.change(select, { target: { value: 'club:bahia' } });
    await waitFor(() => expect(screen.getAllByText('Bahia').length).toBeGreaterThan(1));
    fireEvent.change(screen.getByRole('combobox', { name: 'Rodada final' }), {
      target: { value: '1' },
    });
    await waitFor(() => expect(screen.getAllByText('1').length).toBeGreaterThan(0));
  });
  it('expõe indisponibilidade sem zeros', async () => {
    const service = createCollectiveService({ read: async () => null });
    mount('/', service);
    expect(
      await screen.findAllByText('Dados coletivos indisponíveis'),
    ).not.toHaveLength(0);
    expect(screen.queryByText('79')).not.toBeInTheDocument();
  });
});
