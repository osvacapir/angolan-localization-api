import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { errorHandler } from '@/middleware/errorHandler';
import { rateLimiter } from '@/middleware/rateLimiter';
import { securityHeaders } from '@/middleware/securityHeaders';
import { logger } from '@/utils/logger';
import { connectDatabase } from '@/config/database';
import { connectRedis } from '@/config/redis';

// Routes
import provinceRoutes from '@/routes/provinceRoutes';
import municipalityRoutes from '@/routes/municipalityRoutes';
import authRoutes from '@/routes/authRoutes';
import searchRoutes from '@/routes/searchRoutes';
import statsRoutes from '@/routes/statsRoutes';
import docsRoutes from '@/routes/docsRoutes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_PREFIX = process.env.API_PREFIX || '/api';

// Security middleware
app.use(helmet(
  process.env.HELMET_CSP_ENABLED === 'true'
    ? {}
    : {
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
      }
));

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Compression
app.use(compression());

// Logging
app.use(morgan('combined', {
  stream: {
    write: (message: string) => logger.info(message.trim())
  }
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static files
app.use(express.static('public'));

// Rate limiting
app.use(rateLimiter);

// Security headers
app.use(securityHeaders);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API de Localização de Angola está funcionando',
    timestamp: new Date().toISOString(),
    version: process.env.API_VERSION || 'v1',
  });
});

// API routes
app.use(`${API_PREFIX}/provinces`, provinceRoutes);
app.use(`${API_PREFIX}/municipalities`, municipalityRoutes);
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/search`, searchRoutes);
app.use(`${API_PREFIX}/stats`, statsRoutes);
app.use(`${API_PREFIX}/docs`, docsRoutes);

// Root endpoint - serve the web interface
app.get('/', (req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// API info endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Bem-vindo à API de Localização de Angola',
    version: process.env.API_VERSION || 'v1',
    documentation: `${req.protocol}://${req.get('host')}${API_PREFIX}/docs`,
    endpoints: {
      provinces: `${API_PREFIX}/provinces`,
      municipalities: `${API_PREFIX}/municipalities`,
      search: `${API_PREFIX}/search`,
      stats: `${API_PREFIX}/stats`,
      auth: `${API_PREFIX}/auth`,
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado',
    path: req.originalUrl,
  });
});

// Error handling
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('✅ Database connected successfully');

    // Connect to Redis
    await connectRedis();
    logger.info('✅ Redis connected successfully');

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`🚀 Server running on port ${PORT}`);
      logger.info(`📚 Documentation: http://localhost:${PORT}${API_PREFIX}/docs`);
      logger.info(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});

// Start the server
startServer();

export default app;
