import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }, info) => {
  info.landingErrors = [];
  page.on('pageerror', (error) => info.landingErrors.push(error.message));
  page.on('console', (message) => {
    if (['error', 'warning'].includes(message.type()))
      info.landingErrors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.url().includes('/api/') && response.status() >= 400)
      info.landingErrors.push(`HTTP ${response.status()}`);
  });
});

test.afterEach(async ({ page }, info) => {
  await info.attach('landing-console.json', {
    body: JSON.stringify({ url: page.url(), errors: info.landingErrors }),
    contentType: 'application/json',
  });
  expect(info.landingErrors).toEqual([]);
});

async function ready(page) {
  await page.goto('/');
  await expect(
    page.locator('[data-visualization="evolution-illustration"]'),
  ).toHaveAttribute('data-preview-points', '79');
  await expect(page.locator('.landing-comparison-row')).toHaveCount(4);
  await expect(
    page.locator('.preview-chart .recharts-wrapper > svg.recharts-surface'),
  ).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready);
}

async function captureSection(page, locator, path) {
  const size = page.viewportSize();
  const bounds = await locator.boundingBox();
  await page.setViewportSize({
    width: size.width,
    height: Math.max(1000, Math.ceil(bounds.height) + 200),
  });
  await locator.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  await locator.screenshot({ path });
  await page.setViewportSize(size);
}

test('restaura a composição esportiva, compacta o projeto e preserva a comparação', async ({
  page,
}, info) => {
  await ready(page);
  const title = await page.locator('#landing-title').boundingBox();
  const header = await page.locator('.landing-header').boundingBox();
  expect(title.y).toBeGreaterThan(header.y + header.height + 16);
  expect(title.x).toBeGreaterThanOrEqual(0);
  expect(title.x + title.width).toBeLessThanOrEqual(page.viewportSize().width);
  await expect(page.locator('.stadium-art')).toBeVisible();
  const preview = await page.locator('.product-preview').boundingBox();
  expect(preview.x).toBeGreaterThanOrEqual(0);
  expect(preview.x + preview.width).toBeLessThanOrEqual(page.viewportSize().width);
  await expect(page.locator('.product-preview')).not.toHaveCSS('transform', 'none');
  const project = await page.locator('#projeto').evaluate((element) => {
    const heading = element.querySelector('h2');
    const body = element.querySelector('.editorial-statement');
    const atmosphere = element.querySelector('.project-atmosphere');
    return {
      heading: parseFloat(getComputedStyle(heading).fontSize),
      body: parseFloat(getComputedStyle(body).fontSize),
      font: getComputedStyle(body).fontFamily,
      height: element.getBoundingClientRect().height,
      photoOpacity: Number(getComputedStyle(atmosphere, '::before').opacity),
      photo: getComputedStyle(atmosphere, '::before').backgroundImage,
    };
  });
  expect(project.heading).toBeGreaterThanOrEqual(26);
  expect(project.heading).toBeLessThanOrEqual(40);
  expect(project.body).toBeGreaterThanOrEqual(15);
  expect(project.body).toBeLessThanOrEqual(17);
  expect(project.font).toContain('Poppins');
  expect(project.height).toBeLessThan(690);
  expect(project.photoOpacity).toBeGreaterThanOrEqual(0.04);
  expect(project.photoOpacity).toBeLessThanOrEqual(0.14);
  expect(project.photo).toContain('torcida-estadio.jpg');
  await expect(page.locator('.coverage-metrics')).toContainText('38');
  await expect(page.locator('.coverage-metrics')).toContainText('380');
  await expect(page.locator('.coverage-metrics')).toContainText('20');
  await captureSection(
    page,
    page.locator('.landing-hero'),
    info.outputPath('polish-hero.png'),
  );
  await captureSection(
    page,
    page.locator('#projeto'),
    info.outputPath('polish-project.png'),
  );
  const comparison = page.locator('.live-comparison');
  await comparison.evaluate((element) =>
    element.scrollIntoView({ block: 'center', behavior: 'instant' }),
  );
  const angle = await comparison.evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.abs((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
  });
  expect(angle).toBeGreaterThanOrEqual(0.9);
  expect(angle).toBeLessThanOrEqual(2.1);
  await captureSection(
    page,
    page.locator('#comparacoes'),
    info.outputPath('polish-comparison.png'),
  );
  await page.getByLabel('Comparar Flamengo com').selectOption('club:bahia');
  await expect(comparison).toContainText('Bahia');
  const response = await page.request.get(
    '/api/compare?club_id=club%3Aflamengo&opponent_id=club%3Abahia',
  );
  const { data } = await response.json();
  await expect(
    comparison.locator('.landing-comparison-row').first().locator('strong').nth(0),
  ).toHaveText(String(data[0].points));
  await expect(
    comparison.locator('.landing-comparison-row').first().locator('strong').nth(1),
  ).toHaveText(String(data[1].points));
  await expect(page.getByRole('link', { name: 'Comparar campanhas' })).toHaveAttribute(
    'href',
    /opponent_id=club%3Abahia/,
  );
  await expect(page.getByRole('link', { name: 'Entender a análise' })).toHaveAttribute(
    'href',
    '#metodologia',
  );
  const explore = page
    .locator('.hero-actions')
    .getByRole('link', { name: 'Explorar dashboard' });
  await expect(explore).toHaveAttribute('href', '/dashboard');
  await expect(page.locator('.live-comparison select')).toHaveCSS(
    'font-family',
    /Poppins/,
  );
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBe(true);
  await page.getByRole('link', { name: 'Comparar campanhas' }).click();
  await expect(page).toHaveURL(/dashboard\/comparar.*club%3Abahia/);
});

test('mantém âncoras, foco e seletor de comparação pelo teclado', async ({ page }) => {
  await ready(page);
  await page.getByRole('link', { name: 'Entender a análise', exact: true }).click();
  await expect(page).toHaveURL(/#metodologia$/);
  await expect(page.locator('#metodologia')).toBeInViewport();
  const menu = page.getByRole('button', { name: 'Abrir menu da página inicial' });
  if (await menu.isVisible()) await menu.click();
  await page
    .locator('#landing-navigation')
    .getByRole('link', { name: 'Projeto', exact: true })
    .click();
  await expect(page).toHaveURL(/#projeto$/);
  await expect(page.locator('#project-title')).toBeInViewport();
  const projectTop = await page.locator('#project-title').boundingBox();
  const header = await page.locator('.landing-header').boundingBox();
  expect(projectTop.y).toBeGreaterThanOrEqual(header.y + header.height);
  const select = page.getByLabel('Comparar Flamengo com');
  await select.focus();
  await expect(select).toBeFocused();
  const angle = await page.locator('.live-comparison').evaluate((element) => {
    const matrix = new DOMMatrixReadOnly(getComputedStyle(element).transform);
    return Math.abs((Math.atan2(matrix.b, matrix.a) * 180) / Math.PI);
  });
  expect(angle).toBeLessThanOrEqual(0.6);
  await select.press('ArrowDown');
  await select.press('Enter');
  const selected = await select.evaluate((element) => ({
    value: element.value,
    name: element.selectedOptions[0].textContent,
  }));
  await expect(page.locator('.live-comparison-names')).toContainText(selected.name);
  await expect(page.getByRole('link', { name: 'Comparar campanhas' })).toHaveAttribute(
    'href',
    expect.stringContaining(encodeURIComponent(selected.value)),
  );
});

test.describe('movimento progressivo', () => {
  test.use({ reducedMotion: 'no-preference' });

  test('revela ao rolar sem repetir e responde à redução de movimento', async ({
    page,
  }) => {
    await ready(page);
    const card = page.locator('.feature-card').first();
    await expect(card).toHaveAttribute('data-reveal', 'pending');
    await expect(card).toHaveCSS('opacity', '0');
    const before = await card.evaluate((element) => ({
      top: element.offsetTop,
      height: element.offsetHeight,
    }));
    await card.evaluate((element) =>
      element.scrollIntoView({ block: 'center', behavior: 'instant' }),
    );
    await expect(card).toHaveAttribute('data-reveal', 'shown');
    await expect(card).toHaveCSS('opacity', '1');
    const after = await card.evaluate((element) => ({
      top: element.offsetTop,
      height: element.offsetHeight,
    }));
    expect(after).toEqual(before);
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect(card).toHaveAttribute('data-reveal', 'shown');
    await expect(card).toHaveCSS('opacity', '1');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
    await expect(page.locator('.final-cta')).toHaveCSS('opacity', '1');
    await expect(page.locator('.final-cta')).toHaveCSS('translate', 'none');
  });

  test('mantém conteúdo e comparação utilizáveis sem observador', async ({ page }) => {
    await page.addInitScript(() => {
      window.IntersectionObserver = undefined;
    });
    await ready(page);
    await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
    await expect(page.locator('.feature-card').first()).toHaveCSS('opacity', '1');
    await page.getByLabel('Comparar Flamengo com').selectOption('club:sport');
    await expect(page.locator('.live-comparison-names')).toContainText('Sport');
    await expect(
      page.getByRole('link', { name: 'Comparar campanhas' }),
    ).toHaveAttribute('href', /club%3Asport/);
  });

  test('recupera conteúdo quando a configuração do observador falha', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      window.IntersectionObserver = class {
        constructor() {
          throw new Error('observer-unavailable');
        }
      };
    });
    await ready(page);
    await expect(page.locator('[data-reveal="pending"]')).toHaveCount(0);
    await expect(page.locator('.final-cta')).toHaveCSS('opacity', '1');
  });
});
