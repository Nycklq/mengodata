import { readFileSync } from 'node:fs';
import { render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { createCollectiveService } from '../../backend/src/application/get-collective.js';
import {
  EvolutionIllustration,
  VenueIllustration,
} from '../src/features/landing/presentation/FeatureIllustrations.jsx';

const snapshot = JSON.parse(readFileSync('../data/analytics/collective.json', 'utf8'));
const service = createCollectiveService({ read: async () => snapshot });

it('desenha a evolução com os pontos e rodadas da API', async () => {
  const evolution = await service('evolution');
  const { container } = render(<EvolutionIllustration rows={evolution.data} />);
  expect(screen.getByRole('img')).toHaveAccessibleName(/rodada 1 a 38: 79 pontos/);
  expect(
    container.querySelector('.illustration-series').getAttribute('d').match(/[ML]/g),
  ).toHaveLength(38);
  expect(
    container.querySelector('.illustration-series').getAttribute('d'),
  ).not.toContain('NaN');
});

it('representa os mandos com os mesmos valores e proporções do resumo', async () => {
  const summary = await service('summary');
  const { container } = render(<VenueIllustration rows={summary.data.home_away} />);
  expect(screen.getByRole('img')).toHaveAccessibleName(
    /mandante 47 pontos, visitante 32 pontos/,
  );
  const bars = [...container.querySelectorAll('[data-venue]')];
  expect(
    Number(bars[0].getAttribute('width')) / Number(bars[1].getAttribute('width')),
  ).toBeCloseTo(47 / 32, 4);
});

it('explicita ausência de dados sem números fictícios', () => {
  const { container } = render(
    <>
      <EvolutionIllustration />
      <VenueIllustration />
    </>,
  );
  expect(
    screen
      .getAllByRole('img')
      .every((svg) => svg.textContent.includes('indisponíveis')),
  ).toBe(true);
  expect(container.querySelector('[data-venue]')).toBeNull();
  expect(screen.queryByText('79')).not.toBeInTheDocument();
});
