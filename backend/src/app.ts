import express, { Request, Response, NextFunction } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import rateLimit from 'express-rate-limit';

// Load configurations
dotenv.config();

import { connectDB } from './config/db';
import { initSocketService } from './services/socketService';
import { seedDatabase } from './utils/seeder';

// Routes
import authRoutes from './routes/auth';
import problemRoutes from './routes/problems';
import contestRoutes from './routes/contests';
import discussionRoutes from './routes/discussions';
import aiRoutes from './routes/ai';
import portfolioRoutes from './routes/portfolio';

const app = express();
const server = http.createServer(app);

// 1. WebSocket initialization
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins for local portfolio run
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
initSocketService(io);

// 2. Global rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per windowMs
  message: { message: 'Too many requests from this IP. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use('/api/', limiter);

// Security logs middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  console.log(`[API REQUEST] ${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});

// Basic check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Connect Routes
app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/contests', contestRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/portfolio', portfolioRoutes);

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[SERVER ERROR]:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Startup Server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  // Connect database
  await connectDB();

  // Run seeder
  await seedDatabase();

  server.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(`CodeForge backend running on port http://localhost:${PORT}`);
    console.log(`WebSockets enabled and syncing clients...`);
    console.log(`===============================================`);
  });
};

startServer().catch(err => {
  console.error('Critical failure starting server:', err);
  process.exit(1);
});
