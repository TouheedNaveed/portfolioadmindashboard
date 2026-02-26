import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { globalLimiter, authLimiter } from './middleware/rateLimiter';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth.routes';
import contactRoutes from './routes/contacts.routes';
import { createClient } from '@supabase/supabase-js';

// 🔹 Initialize Supabase with SERVICE ROLE KEY (server-side only)
const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

const app = express();
const PORT = process.env.PORT || 4000;

// 🔥 TRUST PROXY for Railway / Vercel proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// 🔹 Rate limiting (after trust proxy)
app.use(globalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/contacts', contactRoutes);

// 🔹 Temporary Supabase test route (for debugging only)
app.get('/test-supabase', async (_, res) => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) throw error;
    res.json({ success: true, data });
  } catch (err: any) {
    res.json({ success: false, error: err.message });
  }
});

// Health check
app.get('/health', (_, res) => res.json({
  status: 'ok',
  timestamp: new Date().toISOString()
}));

// Global error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 AdminHub server running on port ${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
});
