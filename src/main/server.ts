import 'express-async-errors';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import router from '../infrastructure/http/routes';
import { errorMiddleware } from '../infrastructure/http/middlewares/error.middleware';
import prisma from '../infrastructure/database/prisma.client';

const app = express();
const PORT = process.env.PORT ?? 3000;

// ── Security & Parsing ────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static Frontend ───────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, '..', '..', 'public')));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found.' });
});

// ── Global Error Handler ──────────────────────────────────────────────────────
app.use(errorMiddleware);

// ── Start ─────────────────────────────────────────────────────────────────────
async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully.');

    app.listen(PORT, () => {
      console.log(`🚀 Micro Payment Service running on http://localhost:${PORT}`);
      console.log(`📋 API Base URL: http://localhost:${PORT}/api/v1`);
      console.log(`❤️  Health Check: http://localhost:${PORT}/api/v1/health`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🔄 SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🔄 SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

bootstrap();
