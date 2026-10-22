import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import { normalizeApiOrigin } from './src/features/analytics/infrastructure/api-origin.js';

export default defineConfig(({ mode }) => {
  const environment = loadEnv(
    mode,
    fileURLToPath(new URL('.', import.meta.url)),
    'VITE_',
  );
  const apiOrigin = normalizeApiOrigin(environment.VITE_API_URL);
  if (process.env.VERCEL === '1' && !apiOrigin)
    throw new Error('VITE_API_URL_REQUIRED_ON_VERCEL');
  if (
    process.env.VERCEL === '1' &&
    (!apiOrigin.startsWith('https://') ||
      ['localhost', '127.0.0.1', '[::1]'].includes(new URL(apiOrigin).hostname))
  )
    throw new Error('PUBLIC_HTTPS_API_URL_REQUIRED_ON_VERCEL');
  return {
    plugins: [react()],
    server: {
      proxy: { '/api': 'http://127.0.0.1:3001' },
    },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.js'],
      include: ['tests/**/*.test.{js,jsx}'],
      restoreMocks: true,
    },
  };
});
