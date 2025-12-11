// Express app setup
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

// Import routes
import authRoutes from './routes/authRoutes.js';
import appSpaceRoutes from './routes/appSpaceRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import chartRoutes from './routes/chartRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appspaces', appSpaceRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/insights', aiRoutes);
app.use('/api/charts', chartRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default app;
