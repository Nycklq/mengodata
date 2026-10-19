import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export function readEnvironment() {
  config({
    path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
    quiet: true,
  });
  const result = z
    .object({
      HOST: z.enum(['127.0.0.1', 'localhost']).default('127.0.0.1'),
      PORT: z.coerce.number().int().min(1).max(65535).default(3001),
      CORS_ORIGIN: z.url().default('http://127.0.0.1:5173'),
      LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent'])
        .default('info'),
    })
    .safeParse(process.env);
  if (!result.success) throw new Error('INVALID_ENVIRONMENT');
  return result.data;
}
