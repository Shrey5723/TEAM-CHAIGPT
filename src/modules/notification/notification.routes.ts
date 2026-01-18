import { Router } from 'express';
import * as notificationController from './notification.controller';
import { authenticate } from '../../middleware';

const router = Router();

// Public route for getting notifications by userId (for demo purposes)
router.get('/:userId', notificationController.getUserNotifications);

// Protected routes
router.get('/', authenticate, notificationController.getUserNotifications);
router.get('/unread/count', authenticate, notificationController.getUnreadCount);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.delete('/', authenticate, notificationController.clearAllNotifications);

export default router;
