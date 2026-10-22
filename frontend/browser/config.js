import { defineConfig } from '@playwright/test';
import { fileURLToPath } from 'node:url';

const liveURL = process.env.MENGODATA_LIVE_URL;
if (liveURL && !['127.0.0.1', 'localhost'].includes(new URL(liveURL).hostname))
  throw new Error('LOCAL_BROWSER_URL_REQUIRED');

export default defineConfig({
  testDir: '.',
  testMatch: '*.spec.js',
  outputDir: liveURL ? '../../.tmp/browser-live-tests' : '../../.tmp/browser-tests',
  timeout: 45000,
  expect: { timeout: 10000 },
  workers: 2,
  retries: 0,
  reporter: [
    ['list'],
    [
      'json',
      {
        outputFile: fileURLToPath(
          new URL(
            liveURL
              ? '../../.tmp/browser-live-results.json'
              : '../../.tmp/browser-results.json',
            import.meta.url,
          ),
        ),
      },
    ],
  ],
  use: {
    baseURL: liveURL ?? 'http://127.0.0.1:4174',
    channel: process.env.MENGODATA_BROWSER_CHANNEL ?? 'chrome',
    headless: true,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [375, 768, 1024, 1440].flatMap((width) =>
    ['light', 'dark'].map((colorScheme) => ({
      name: `${width}-${colorScheme}`,
      use: { viewport: { width, height: 1000 }, colorScheme },
    })),
  ),
  webServer: liveURL
    ? undefined
    : {
        command: 'node frontend/browser/serve.mjs',
        cwd: '../..',
        url: 'http://127.0.0.1:4174',
        reuseExistingServer: false,
        timeout: 30000,
      },
});
