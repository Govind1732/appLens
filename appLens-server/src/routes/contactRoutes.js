// Contact form routes
import express from 'express';
import { sendContactEmail } from '../controllers/contactController.js';

const router = express.Router();

// POST /api/contact/send-email
router.post('/send-email', sendContactEmail);

export default router;
