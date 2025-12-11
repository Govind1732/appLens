import express from 'express';
import authController from '../controllers/authController.js';

const router = express.Router();

// POST /auth/signup
router.post('/signup', authController.signup);

// POST /auth/login
router.post('/login', authController.login);

export default router;
