import express from 'express';
import chartController from '../controllers/chartController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// POST /api/charts/generate - Generate chart data with aggregation
router.post('/generate', chartController.generateChart);

export default router;
