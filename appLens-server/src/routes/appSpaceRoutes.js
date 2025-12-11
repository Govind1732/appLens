import express from 'express';
import appSpaceController from '../controllers/appSpaceController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// GET /app-spaces - Get all app spaces for current user
router.get('/', appSpaceController.getAppSpaces);

// POST /app-spaces - Create a new app space
router.post('/', appSpaceController.createAppSpace);

// GET /app-spaces/:id - Get app space by ID
router.get('/:id', appSpaceController.getAppSpaceById);

// PUT /app-spaces/:id - Update app space
router.put('/:id', appSpaceController.updateAppSpace);

// DELETE /app-spaces/:id - Delete app space
router.delete('/:id', appSpaceController.deleteAppSpace);

export default router;
