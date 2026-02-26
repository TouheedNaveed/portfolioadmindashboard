import 'dotenv/config';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contacts.routes';
import { createClient } from '@supabase/supabase-js';

// -------------------------
// Initialize Supabase
// -------------------------
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// -------------------------
// Initialize Express App
// -------------------------
const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 4000;

// -------------------------
// TRUST PROXY
// Needed for Railway / Vercel behind proxies
// Must be set BEFORE rate limiter
// -------------------------
app.set('trust proxy', 1);

// -------------------------
// Security & Middlewares
// -------------------------
app.use(helmet());
app.use(
  cors({
    origin: process.env.CLIENT_URL?.replace(/\/$/, '') || '*',
    credentials: true,
  })
);
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// -------------------------
// Rate Limiters
// -------------------------
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip,
});

const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => req.ip,
});

app.use(globalLimiter);

// -------------------------
// Routes
// -------------------------
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contacts', contactRoutes);

// -------------------------
// Health Check & Test
// -------------------------
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Temporary Supabase test route (remove after testing)
app.get('/test-supabase', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------
// Global Error Handler
// -------------------------
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  // Ensure errorHandler is type-safe
  errorHandler(err, _req, res, _next);
});

// -------------------------
// Start Server
// -------------------------
app.listen(PORT, () => {
  console.log(`🚀 AdminHub server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
