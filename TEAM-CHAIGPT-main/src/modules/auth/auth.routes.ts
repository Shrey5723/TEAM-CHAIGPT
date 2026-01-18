import { Router } from 'express';
import { authController } from './auth.controller';
import { authenticate } from '../../middleware';

const router = Router();

// Public routes
router.post('/register', authController.register.bind(authController));
router.post('/login', authController.login.bind(authController));

// Protected routes
router.get('/profile', authenticate, authController.getProfile.bind(authController));

export default router;
