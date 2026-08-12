import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

import publicRoutes from './routes/public.routes';
import authRoutes from './routes/auth.routes';
import adminRoutes from './routes/admin.routes';
import kitchenRoutes from './routes/kitchen.routes';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());

// Healthcheck & Root API Directory Routes
app.get(['/', '/api'], (req, res) => {
  res.json({
    status: 'ok',
    system: 'TeaWala Backend REST API',
    message: 'Welcome to TeaWala API Server 🚀',
    endpoints: {
      health: '/api/health',
      publicMenu: '/api/public/menu/:tableToken',
      auth: '/api/auth/login',
      admin: '/api/admin/dashboard',
      kitchen: '/api/kitchen/orders',
    },
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', system: 'TeaWala Backend API', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/kitchen', kitchenRoutes);

// Global Error Handler
app.use(errorHandler);

// Serve static frontend files in production (Render single-service deployment)
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(frontendDistPath, 'index.html'), (err) => {
    if (err) next();
  });
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`🚀 CafeQR Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
