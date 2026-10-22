import { readFileSync } from 'node:fs';
import { fireEvent, render, within, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CollectivePlot from '../src/features/analytics/presentation/CollectivePlot.jsx';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';

const snapshot = JSON.parse(readFileSync('../data/analytics/collective.json', 'utf8'));
const service = createCollectiveService({ read: async () => snapshot });
function dimensions(width) {
  const bounds = {
    width,
    height: 260,
    top: 0,
    left: 0,
    right: width,
    bottom: 260,
    x: 0,
    y: 0,
    toJSON() {},
  };
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(
    function () {
      if (this.classList.contains('recharts-legend-wrapper'))
        return { ...bounds, height: 22, bottom: 22 };
      if (this.tagName === 'SPAN')
        return {
          ...bounds,
          width: (this.textContent?.length ?? 0) * 5,
          height: 12,
          bottom: 12,
        };
      return bounds;
    },
  );
  vi.stubGlobal(
    'ResizeObserver',
    class {
      constructor(callback) {
        this.callback = callback;
      }
      observe(target) {
        this.callback([{ target, contentRect: target.getBoundingClientRect() }]);
      }
      unobserve() {}
      disconnect() {}
    },
  );
}
afterEach(() => {
  vi.unstubAllGlobals();
  document.documentElement.removeAttribute('data-theme');
});
const bars = (container) => [
  ...container.querySelectorAll('.recharts-bar-rectangle path'),
];

describe('geometria real do Recharts', () => {
  it.each(
    [375, 768, 1024, 1440].flatMap((width) =>
      ['light', 'dark'].map((theme) => [width, theme]),
    ),
  )('renderiza 47 e 32 desde zero em %spx e tema %s', async (width, theme) => {
    dimensions(width);
    document.documentElement.dataset.theme = theme;
    const summary = await service('summary');
    const rows = summary.data.home_away.map((row) => ({
      ...row,
      name: row.venue === 'home' ? 'Mandante' : 'Visitante',
    }));
    const { container } = render(
      <CollectivePlot rows={rows} category="name" bars height={260} />,
    );
    await waitFor(() => expect(bars(container)).toHaveLength(2));
    const heights = bars(container).map((bar) => Number(bar.getAttribute('height')));
    expect(heights.every((height) => height > 0)).toBe(true);
    expect(heights[0] / heights[1]).toBeCloseTo(47 / 32, 4);
    const bottoms = bars(container).map(
      (bar) => Number(bar.getAttribute('y')) + Number(bar.getAttribute('height')),
    );
    expect(bottoms[0]).toBeCloseTo(bottoms[1], 4);
    expect(within(container).getAllByText('47').length).toBeGreaterThan(0);
    expect(within(container).getAllByText('32').length).toBeGreaterThan(0);
    expect(within(container).getAllByText('0').length).toBeGreaterThan(0);
  });
  it('recalcula as barras a partir de uma janela real de rodadas', async () => {
    dimensions(375);
    const summary = await service('summary', { from_round: 10, to_round: 20 });
    const rows = summary.data.home_away.map((row) => ({ ...row, name: row.venue }));
    const { container } = render(<CollectivePlot rows={rows} category="name" bars />);
    await waitFor(() => expect(bars(container)).toHaveLength(2));
    expect(
      Number(bars(container)[0].getAttribute('height')) /
        Number(bars(container)[1].getAttribute('height')),
    ).toBeCloseTo(rows[0].points / rows[1].points, 4);
  });
  it('preserva zero e valores negativos sem criar altura artificial', async () => {
    dimensions(768);
    const { container } = render(
      <CollectivePlot
        rows={[
          { name: 'A', goal_difference: -8 },
          { name: 'B', goal_difference: 0 },
          { name: 'C', goal_difference: 12 },
        ]}
        metrics={['goal_difference']}
        category="name"
        bars
      />,
    );
    await waitFor(() => expect(bars(container)).toHaveLength(2));
    expect(within(container).getAllByText('-8').length).toBeGreaterThan(0);
    expect(container.querySelector('[role="img"]')).toHaveAccessibleName(/B: Saldo 0/);
    expect(
      bars(container).every((bar) => Math.abs(Number(bar.getAttribute('height'))) > 0),
    ).toBe(true);
  });
  it('mostra dados vazios sem falhar', () => {
    dimensions(375);
    const { container } = render(<CollectivePlot rows={[]} category="name" bars />);
    expect(bars(container)).toHaveLength(0);
  });
  it('permite ocultar e reexibir uma série pela legenda', async () => {
    dimensions(768);
    const summary = await service('summary');
    const { container } = render(
      <CollectivePlot
        rows={summary.data.home_away.map((row) => ({ ...row, name: row.venue }))}
        category="name"
        bars
      />,
    );
    await waitFor(() => expect(bars(container)).toHaveLength(2));
    const button = within(container).getByRole('button', { name: 'Pontos' });
    fireEvent.click(button);
    await waitFor(() => expect(bars(container)).toHaveLength(0));
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    await waitFor(() => expect(bars(container)).toHaveLength(2));
  });
  it('representa uma única rodada com marcadores reais, inclusive saldo negativo', async () => {
    dimensions(375);
    const evolution = await service('evolution', { from_round: 7, to_round: 7 });
    const { container } = render(
      <CollectivePlot
        rows={evolution.data}
        metrics={['goals_for', 'goal_difference']}
      />,
    );
    await waitFor(() =>
      expect(container.querySelectorAll('.recharts-area-dot')).toHaveLength(2),
    );
    expect(evolution.data[0].goal_difference).toBe(-1);
  });
});
