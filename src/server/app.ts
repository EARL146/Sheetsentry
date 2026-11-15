/**
 * SheetSentry Backend Express Application
 * Implements RESTful API Specification (Node 136:1683) backed by MySQL 8 / phpMyAdmin
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { authRouter } from './routes/authRoutes';
import { workspaceRouter } from './routes/workspaceRoutes';
import { uploadRouter } from './routes/uploadRoutes';
import { profileRouter } from './routes/profileRoutes';
import { jobRouter } from './routes/jobRoutes';
import { adminRouter } from './routes/adminRoutes';
import { errorHandler } from './middleware/errorHandler';
import { getDb } from './database/dbInterface';

export const createApp = (): express.Application => {
  const app = express();
  app.disable('x-powered-by');

  const allowedOrigins = (
    process.env.CORS_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'
  )
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    next();
  });

  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(null, false);
        }
      },
      credentials: true,
    })
  );
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // Healthcheck (without exposing internal DB schema names or admin URLs)
  app.get('/api/health', async (_req: Request, res: Response) => {
    const db = getDb();
    const dbConnected = await db.ping();
    res.status(200).json({
      status: 'UP',
      service: 'SheetSentry API',
      version: '1.0.0',
      database: {
        engine: db.isLive() ? 'mysql8' : 'in-memory',
        connected: dbConnected,
      },
      timestamp: new Date().toISOString(),
    });
  });

  // API Route Groups
  app.use('/api/v1/auth', authRouter);
  app.use('/api/v1/workspaces', workspaceRouter);
  app.use('/api/v1/uploads', uploadRouter);
  app.use('/api/v1/profiles', profileRouter);
  app.use('/api/v1/jobs', jobRouter);
  app.use('/api/v1/admin', adminRouter);

  // Centralized Error Handling
  app.use(errorHandler);

  return app;
};

export const app = createApp();
