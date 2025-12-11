import express from 'express';
import aiController from '../controllers/aiController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /ai/summary/:datasetId - Generate AI summary for a dataset
router.post('/summary/:datasetId', aiController.generateSummary);

// POST /ai/chat/:datasetId - Chat with AI about a dataset
router.post('/chat/:datasetId', aiController.chat);

// GET /ai/insights/:datasetId - Get all insights for a dataset
router.get('/insights/:datasetId', aiController.getInsights);

// GET /ai/chart-suggestions/:datasetId - Get chart suggestions for a dataset
router.get('/chart-suggestions/:datasetId', aiController.getChartSuggestions);

// POST /ai/generate-chart-suggestions/:datasetId - Generate chart suggestions based on schema
router.post('/generate-chart-suggestions/:datasetId', aiController.generateChartSuggestions);

export default router;
