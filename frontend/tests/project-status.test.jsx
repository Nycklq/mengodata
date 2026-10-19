import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { loadProjectStatus } from '../src/features/project-status/application/load-project-status.js';
import { createHttpProjectGateway } from '../src/features/project-status/infrastructure/http-project-gateway.js';
import { ProjectStatus } from '../src/features/project-status/presentation/ProjectStatus.jsx';

const metadata = {
  schema_version: 2,
  scope: {
    competition_id: 'competition:brasileirao-serie-a-men',
    season: 2025,
    team_id: 'club:flamengo',
    first_round: 1,
    last_round: 38,
  },
  label: 'Brasileirão Série A 2025 — temporada completa (rodadas 1 a 38)',
  source_status: 'pending',
  data_status: 'unavailable',
  dataset_version: null,
  coverage: null,
};

function renderStatus(loadStatus) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <ProjectStatus loadStatus={loadStatus} />
    </QueryClientProvider>,
  );
}

describe('status presentation', () => {
  it('shows loading before metadata arrives', () => {
    renderStatus(() => new Promise(() => {}));
    expect(screen.getByRole('status')).toHaveTextContent('Carregando');
  });

  it('shows pending source and no fabricated statistics', async () => {
    renderStatus(async () => metadata);
    expect(await screen.findByText(metadata.label)).toBeInTheDocument();
    expect(
      screen.getByText(/estatísticas ainda estão indisponíveis/),
    ).toBeInTheDocument();
    expect(screen.queryByText(/0 gols/)).not.toBeInTheDocument();
  });

  it('allows a failed request to be retried', async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValue(metadata);
    renderStatus(load);
    expect(await screen.findByRole('alert')).toHaveTextContent('Não foi possível');
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }));
    expect(await screen.findByText(metadata.label)).toBeInTheDocument();
  });
});

describe('application and HTTP gateway', () => {
  it('rejects a response outside the fixed scope', async () => {
    const gateway = {
      getMetadata: async () => ({
        ...metadata,
        scope: { ...metadata.scope, last_round: 19 },
      }),
    };
    await expect(loadProjectStatus(gateway)).rejects.toThrow('PROJECT_SCOPE_MISMATCH');
  });

  it('preserves unavailable values and forwards cancellation', async () => {
    const fetchRequest = vi
      .fn()
      .mockResolvedValue({ ok: true, json: async () => metadata });
    const controller = new AbortController();
    const gateway = createHttpProjectGateway(fetchRequest);
    const result = await loadProjectStatus(gateway, controller.signal);
    expect(result.coverage).toBeNull();
    expect(fetchRequest).toHaveBeenCalledWith('/api/metadata', {
      signal: controller.signal,
    });
  });

  it('rejects unexpected HTTP failures', async () => {
    const gateway = createHttpProjectGateway(async () => ({ ok: false }));
    await expect(loadProjectStatus(gateway)).rejects.toThrow('METADATA_REQUEST_FAILED');
  });

  it('rejects false numeric coverage in the transport', async () => {
    const gateway = createHttpProjectGateway(async () => ({
      ok: true,
      json: async () => ({ ...metadata, coverage: 0 }),
    }));
    await expect(loadProjectStatus(gateway)).rejects.toThrow();
  });

  it('rejects the legacy contract version', async () => {
    const gateway = createHttpProjectGateway(async () =>
      Response.json({ ...metadata, schema_version: 1 }),
    );
    await expect(loadProjectStatus(gateway)).rejects.toThrow();
  });

  it.each([2024, 2026])(
    'rejects a metadata response from season %i',
    async (season) => {
      const gateway = createHttpProjectGateway(async () =>
        Response.json({
          ...metadata,
          scope: { ...metadata.scope, season },
        }),
      );
      await expect(loadProjectStatus(gateway)).rejects.toThrow(
        'PROJECT_SCOPE_MISMATCH',
      );
    },
  );
});
