import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth.routes.js';
import deviceRoutes from './routes/device.routes.js';
import trackingRoutes from './routes/tracking.routes.js';
import commandRoutes from './routes/command.routes.js';
import mediaRoutes from './routes/media.routes.js';
import activityRoutes from './routes/activity.routes.js';
import geofenceRoutes from './routes/geofence.routes.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';
import { logger } from './utils/logger.js';

export function createApp() {
  const app = express();
  app.use(helmet());
  app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*', credentials: true }));
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(mongoSanitize());
  app.use(rateLimit({ windowMs: 15 * 60 * 1000, limit: 300, standardHeaders: true }));
  app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

  app.get('/health', (_req, res) => res.json({ ok: true, service: 'secureguard-api' }));
  app.use('/api/auth', authRoutes);
  app.use('/api/devices', deviceRoutes);
  app.use('/api/tracking', trackingRoutes);
  app.use('/api/commands', commandRoutes);
  app.use('/api/media', mediaRoutes);
  app.use('/api/activity', activityRoutes);
  app.use('/api/geofences', geofenceRoutes);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
