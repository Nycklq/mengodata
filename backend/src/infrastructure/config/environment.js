import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

export function readEnvironment() {
  if (process.env.NODE_ENV !== 'production')
    config({
      path: fileURLToPath(new URL('../../../../.env', import.meta.url)),
      quiet: true,
    });
  const result = z
    .object({
      NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
      HOST: z.enum(['127.0.0.1', 'localhost', '0.0.0.0']).default('127.0.0.1'),
      PORT: z.coerce.number().int().min(1).max(65535).default(3001),
      CORS_ORIGIN: z
        .url()
        .refine((value) => {
          try {
            const url = new URL(value);
            return (
              ['http:', 'https:'].includes(url.protocol) &&
              !url.username &&
              !url.password &&
              url.pathname === '/' &&
              !url.search &&
              !url.hash
            );
          } catch {
            return false;
          }
        })
        .transform((value) => new URL(value).origin)
        .default('http://127.0.0.1:5173'),
      DATABASE_URL: z.preprocess(
        (value) => value || undefined,
        z.string().min(1).optional(),
      ),
      TRUST_PROXY_HOPS: z.coerce.number().int().min(0).max(5).default(0),
      LOG_LEVEL: z
        .enum(['fatal', 'error', 'warn', 'info', 'debug', 'silent'])
        .default('info'),
    })
    .superRefine((environment, context) => {
      if (environment.NODE_ENV !== 'production') return;
      if (!environment.DATABASE_URL)
        context.addIssue({
          code: 'custom',
          path: ['DATABASE_URL'],
          message: 'Required',
        });
      if (!environment.CORS_ORIGIN.startsWith('https://'))
        context.addIssue({
          code: 'custom',
          path: ['CORS_ORIGIN'],
          message: 'HTTPS required',
        });
    })
    .safeParse(process.env);
  if (!result.success) throw new Error('INVALID_ENVIRONMENT');
  return result.data;
}
