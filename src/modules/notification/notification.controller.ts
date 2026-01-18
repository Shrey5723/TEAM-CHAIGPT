import { Request, Response } from 'express';
import { notificationService } from './notification.service';
import { asyncHandler, sendResponse } from '../../shared/utils';

export const getUserNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.params.userId || req.user!.id;
    const { isRead, type, limit } = req.query;

    const notifications = await notificationService.getUserNotifications(userId, {
        isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
        type: type as string,
        limit: limit ? parseInt(limit as string) : undefined,
    });

    sendResponse(res, 200, notifications);
});

export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const notification = await notificationService.markAsRead(id, userId);
    sendResponse(res, 200, notification);
});

export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.markAllAsRead(userId);
    sendResponse(res, 200, result);
});

export const getUnreadCount = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.getUnreadCount(userId);
    sendResponse(res, 200, result);
});

export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const { id } = req.params;
    const result = await notificationService.deleteNotification(id, userId);
    sendResponse(res, 200, result);
});

export const clearAllNotifications = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await notificationService.clearAllNotifications(userId);
    sendResponse(res, 200, result);
});
