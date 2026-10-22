import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { z } from 'zod';
import { registerAnalyticsRoutes } from './analytics-routes.js';
import { registerCollectiveRoutes } from './collective-routes.js';

const emptyQuery = z.object({}).strict();

export function createApp({
  getMetadata,
  getAnalytics,
  getCollective,
  logger,
  corsOrigin,
  trustProxyHops = 0,
  rateLimit = 300,
}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', trustProxyHops);
  app.use(helmet());
  app.use(
    cors({
      origin: (origin, callback) => callback(null, origin === corsOrigin),
      methods: ['GET', 'HEAD', 'OPTIONS'],
    }),
  );
  app.use(pinoHttp({ logger }));
  const clients = new Map();
  app.use('/api', (request, response, next) => {
    const now = Date.now();
    for (const [key, value] of clients) if (value.until <= now) clients.delete(key);
    const key = request.ip;
    const entry = clients.get(key) ?? { count: 0, until: now + 60000 };
    entry.count += 1;
    clients.set(key, entry);
    if (clients.size > 10000) clients.delete(clients.keys().next().value);
    if (entry.count > rateLimit)
      return response
        .set('Retry-After', '60')
        .status(429)
        .json({ error: { code: 'RATE_LIMITED' } });
    next();
  });

  app.get('/api/health', (request, response) => {
    if (!emptyQuery.safeParse(request.query).success)
      return response.status(400).json({ error: { code: 'INVALID_QUERY' } });
    response.json({ status: 'ok', service: 'flamengo-analytics-api' });
  });

  app.get('/api/metadata', async (request, response) => {
    if (!emptyQuery.safeParse(request.query).success) {
      return response.status(400).json({ error: { code: 'INVALID_QUERY' } });
    }
    response.set('Cache-Control', 'no-store');
    response.json(await getMetadata());
  });

  if (getCollective) registerCollectiveRoutes(app, getCollective);
  else if (getAnalytics) registerAnalyticsRoutes(app, getAnalytics);

  app.use((request, response) => {
    response.status(404).json({ error: { code: 'NOT_FOUND' } });
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) return next(error);
    request.log.error({ code: 'INTERNAL_ERROR' }, 'Falha ao processar requisição');
    response.status(500).json({ error: { code: 'INTERNAL_ERROR' } });
  });

  return app;
}
