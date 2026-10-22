import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type())) errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().includes('/api/') && response.status() >= 400)
      errors.push(`HTTP ${response.status()} ${new URL(response.url()).pathname}`);
  });
  await page.addInitScript(
    (theme) => localStorage.setItem('mengodata-theme', theme),
    info.project.use.colorScheme,
  );
  info.errorsInBrowser = errors;
});

test.afterEach(async ({ page }, info) => {
  await info.attach('environment.json', {
    body: JSON.stringify({
      url: page.url(),
      viewport: page.viewportSize(),
      theme: info.project.use.colorScheme,
    }),
    contentType: 'application/json',
  });
  await info.attach('console.json', {
    body: JSON.stringify(info.errorsInBrowser),
    contentType: 'application/json',
  });
  expect(info.errorsInBrowser).toEqual([]);
});

async function expectPaintable(chart) {
  const viewport = chart.locator('.recharts-wrapper > svg.recharts-surface');
  await expect(viewport).toHaveCount(1);
  await expect
    .poll(async () => (await viewport.boundingBox())?.width ?? 0)
    .toBeGreaterThan(80);
  const geometry = await chart.evaluate((element) => {
    const wrapper = element.querySelector('.recharts-wrapper');
    const svg = wrapper.querySelector(':scope > svg.recharts-surface');
    const shapes = [
      ...svg.querySelectorAll(
        '.recharts-bar-rectangle path, .recharts-area-curve, .recharts-area-dot',
      ),
    ];
    const styleVisible = (shape) => {
      const style = getComputedStyle(shape);
      return (
        style.display !== 'none' &&
        style.visibility !== 'hidden' &&
        Number(style.opacity) > 0 &&
        (style.fill !== 'none' || style.stroke !== 'none')
      );
    };
    return {
      wrapper: wrapper.getBoundingClientRect().toJSON(),
      viewport: svg.getBoundingClientRect().toJSON(),
      shapes: shapes.map((shape) => ({
        bounds: shape.getBoundingClientRect().toJSON(),
        visible: styleVisible(shape),
        path: shape.getAttribute('d') ?? '',
        length: typeof shape.getTotalLength === 'function' ? shape.getTotalLength() : 1,
      })),
      font: getComputedStyle(svg.querySelector('text')).fontFamily,
    };
  });
  expect(geometry.wrapper.width).toBeGreaterThan(80);
  expect(geometry.viewport.height).toBeGreaterThan(80);
  expect(geometry.shapes.length).toBeGreaterThan(0);
  for (const shape of geometry.shapes) {
    expect(shape.visible).toBe(true);
    expect(shape.length).toBeGreaterThan(0);
    expect(shape.path).not.toMatch(/NaN|undefined/);
  }
  expect(geometry.font).toContain('Poppins');
  return geometry;
}

const pages = [
  ['/dashboard', 2],
  ['/dashboard/classificacao', 1],
  ['/dashboard/comparar', 1],
  ['/dashboard/ofensivo', 2],
  ['/dashboard/defensivo', 2],
  ['/dashboard/estatisticas', 2],
  ['/dashboard/partidas', 0],
  ['/dashboard/power-bi', 0],
  ['/dashboard/metodologia', 0],
];

test('audita os gráficos de todas as páginas do dashboard com CSS real', async ({
  page,
}, info) => {
  for (const [path, count] of pages) {
    await page.goto(path);
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('.collective-chart')).toHaveCount(count);
    await page.evaluate(() => document.fonts.ready);
    for (const chart of await page.locator('.collective-chart').all())
      await expectPaintable(chart);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    if (path.endsWith('/ofensivo') || path.endsWith('/defensivo')) {
      const ranking = page.locator('.collective-chart').first();
      await expect(ranking.locator('.recharts-bar-rectangle path')).toHaveCount(20);
      const response = await page.request.get(
        '/api/analytics/' + (path.endsWith('/ofensivo') ? 'offensive' : 'defensive'),
      );
      expect(response.ok()).toBe(true);
      const { data } = await response.json();
      const values = await ranking
        .locator('.recharts-bar-rectangle path')
        .evaluateAll((shapes) =>
          shapes.map((shape) => ({
            name: shape.getAttribute('name'),
            width: Number(shape.getAttribute('width')),
            fill: getComputedStyle(shape).fill,
          })),
        );
      expect(values.map((row) => row.name)).toEqual(data.rows.map((row) => row.name));
      const metric = data.metric;
      for (let i = 0; i < values.length; i++)
        expect(values[i].width / values[0].width).toBeCloseTo(
          data.rows[i][metric] / data.rows[0][metric],
          3,
        );
      expect(values.find((row) => row.name === 'Flamengo').fill).toBe(
        'rgb(195, 39, 29)',
      );
      await page
        .locator('.panel')
        .first()
        .screenshot({ path: info.outputPath(path.split('/').at(-1) + '.png') });
      await page
        .locator('.panel')
        .nth(1)
        .screenshot({
          path: info.outputPath(path.split('/').at(-1) + '-evolution.png'),
        });
    }
    if (path === '/dashboard')
      await page
        .locator('#casa-fora')
        .screenshot({ path: info.outputPath('home-away.png') });
  }
});

test('mantém barras proporcionais, tooltips e atualização por rodada', async ({
  page,
}, info) => {
  await page.goto('/dashboard');
  const chart = page.locator('#casa-fora .collective-chart');
  await expectPaintable(chart);
  const summary = await (await page.request.get('/api/summary')).json();
  const readBars = () =>
    chart.locator('.recharts-bar-rectangle path').evaluateAll((shapes) =>
      shapes.map((shape) => ({
        height: Number(shape.getAttribute('height')),
        bottom: Number(shape.getAttribute('y')) + Number(shape.getAttribute('height')),
      })),
    );
  const shapes = await readBars();
  expect(shapes).toHaveLength(2);
  expect(shapes[0].height).toBeGreaterThan(0);
  expect(shapes[1].height).toBeGreaterThan(0);
  expect(shapes[0].height / shapes[1].height).toBeCloseTo(
    summary.data.home_away[0].points / summary.data.home_away[1].points,
    4,
  );
  expect(shapes[0].bottom).toBeCloseTo(shapes[1].bottom, 4);
  await chart.locator('.recharts-bar-rectangle path').nth(1).hover();
  await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText('Visitante');
  await expect(chart.locator('.recharts-tooltip-wrapper')).toContainText(
    String(summary.data.home_away[1].points),
  );
  await chart.screenshot({ path: info.outputPath('tooltip-home-away.png') });
  await page.getByRole('combobox', { name: /Rodada inicial/ }).selectOption('10');
  await page.getByRole('combobox', { name: /Rodada final/ }).selectOption('20');
  const filtered = await (
    await page.request.get('/api/summary?from_round=10&to_round=20')
  ).json();
  await expect
    .poll(async () => {
      const bars = await readBars();
      return bars.length === 2 ? bars[0].height / bars[1].height : 0;
    })
    .toBeCloseTo(
      filtered.data.home_away[0].points / filtered.data.home_away[1].points,
      4,
    );
  await expect(page).toHaveURL(/from_round=10.*to_round=20/);
  await expectPaintable(chart);
  await page.goto('/dashboard/ofensivo?from_round=7&to_round=7');
  const evolution = page.locator('.collective-chart').last();
  await expectPaintable(evolution);
  await expect(evolution.locator('.recharts-area-dot')).toHaveCount(2);
  const single = await (
    await page.request.get('/api/evolution?from_round=7&to_round=7')
  ).json();
  expect(single.data[0].goal_difference).toBeLessThan(0);
  await evolution.screenshot({ path: info.outputPath('single-round-negative.png') });
});

test('a legenda alterna as séries sem perder a escala', async ({ page }) => {
  await page.goto('/dashboard/ofensivo');
  const chart = page.locator('.collective-chart').last();
  await expectPaintable(chart);
  const button = chart.getByRole('button', { name: 'Gols pró', exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-pressed', 'false');
  await expect(chart.locator('.recharts-area-curve')).toHaveCount(1);
  await button.click();
  await expect(chart.locator('.recharts-area-curve')).toHaveCount(2);
  await expectPaintable(chart);
});

test('mostra as três ilustrações da landing com valores reais e proporções úteis', async ({
  page,
}, info) => {
  await page.goto('/');
  const features = page.locator('.feature-grid');
  await expect(
    page.locator('[data-visualization="evolution-illustration"]'),
  ).toHaveAttribute('data-preview-points', '79');
  await page.evaluate(() => document.fonts.ready);
  const summary = await (await page.request.get('/api/summary')).json();
  const evolution = page.locator('[data-visualization="evolution-illustration"]');
  const venue = page.locator('[data-visualization="venue-illustration"]');
  await expect(evolution).toHaveAttribute(
    'data-preview-points',
    String(summary.data.club.points),
  );
  const dimensions = await features.locator('.feature-art').evaluateAll((cards) =>
    cards.map((card) => {
      const svg = card.querySelector('.feature-illustration');
      const illustration = svg ?? card.querySelector('.versus-preview');
      const bounds = illustration.getBoundingClientRect();
      return {
        width: bounds.width,
        height: bounds.height,
        availableHeight: card.getBoundingClientRect().height,
        font: svg
          ? getComputedStyle(svg.querySelector('text')).fontFamily
          : getComputedStyle(card).fontFamily,
      };
    }),
  );
  for (const box of dimensions) {
    expect(box.width).toBeGreaterThan(140);
    expect(box.height).toBeGreaterThan(70);
    expect(box.font).toContain('Poppins');
  }
  await expect(evolution.locator('.illustration-series')).toHaveCSS(
    'stroke',
    'rgb(195, 39, 29)',
  );
  const bars = await venue.locator('[data-venue]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      points: Number(node.dataset.points),
      width: Number(node.getAttribute('width')),
    })),
  );
  expect(bars.map((row) => row.points)).toEqual(
    summary.data.home_away.map((row) => row.points),
  );
  expect(bars[0].width / bars[1].width).toBeCloseTo(bars[0].points / bars[1].points, 4);
  await expect(features.locator('.comparison-art img')).toHaveAttribute(
    'src',
    '/brand/flamengo.png',
  );
  await expect(features.locator('.comparison-art img')).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  for (const chart of await page.locator('.collective-chart').all())
    await expectPaintable(chart);
  const featuresBox = await features.boundingBox();
  await page.setViewportSize({
    ...page.viewportSize(),
    height: Math.max(1000, Math.ceil(featuresBox.height) + 200),
  });
  await features.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await features.screenshot({ path: info.outputPath('landing-features.png') });
  await page
    .locator('.venue-story')
    .screenshot({ path: info.outputPath('landing-venue.png') });
  await features.getByRole('link', { name: /Dentro e fora de casa/ }).click();
  await expect(page).toHaveURL('/dashboard#casa-fora');
  await expectPaintable(page.locator('#casa-fora .collective-chart'));
});
