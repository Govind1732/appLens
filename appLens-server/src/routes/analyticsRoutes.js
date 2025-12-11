import express from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/analytics/overview?appSpaceId=...
// Get analytics overview for an app space
router.get('/overview', authMiddleware, getAnalyticsOverview);

export default router;
