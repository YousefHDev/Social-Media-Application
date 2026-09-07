import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import helmet from 'helmet';
import cors from 'cors';
import { config } from './config/env.js';
import connectDB from './config/db.js';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorMiddleware.js';
import { apiLimiter } from './middleware/rateLimitMiddleware.js';
import { sendError } from './utils/responseHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for inline scripts/styles in vanilla SPA static frontend
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl) or if wildcard configured
      if (!origin || config.corsOrigin === '*') {
        return callback(null, true);
      }
      const allowedOrigins = config.corsOrigin.split(',').map((o) => o.trim());
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware to ensure database connection before processing API requests
app.use('/api', async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (error) {
    return sendError(res, 500, 'Database Connection Failure', error.message);
  }
});

// Rate limiting on API routes
app.use('/api', apiLimiter);

// API Routes
app.use('/api', routes);

// Serve uploads directory
const isVercel = process.env.VERCEL === '1';
const uploadsPath = isVercel
  ? path.join('/tmp', 'uploads')
  : path.join(__dirname, '../public/uploads');

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// Serve static frontend files from public/ folder
app.use(express.static(path.join(__dirname, '../public')));

// Fallback index.html for single page application routing
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return sendError(res, 404, 'API endpoint not found');
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Global Error Handler
app.use(errorHandler);

export default app;
