import { prisma } from '../../config';
import { AppError } from '../../shared/utils';

export class NotificationService {
    // Get user notifications
    async getUserNotifications(userId: string, filters?: {
        isRead?: boolean;
        type?: string;
        limit?: number;
    }) {
        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                isRead: filters?.isRead,
                type: filters?.type as any,
            },
            orderBy: { createdAt: 'desc' },
            take: filters?.limit || 50,
        });

        return notifications;
    }

    // Mark notification as read
    async markAsRead(notificationId: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        const updated = await prisma.notification.update({
            where: { id: notificationId },
            data: { isRead: true },
        });

        return updated;
    }

    // Mark all notifications as read
    async markAllAsRead(userId: string) {
        const result = await prisma.notification.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true },
        });

        return { markedAsRead: result.count };
    }

    // Get unread count
    async getUnreadCount(userId: string) {
        const count = await prisma.notification.count({
            where: { userId, isRead: false },
        });

        return { unreadCount: count };
    }

    // Delete notification
    async deleteNotification(notificationId: string, userId: string) {
        const notification = await prisma.notification.findFirst({
            where: { id: notificationId, userId },
        });

        if (!notification) {
            throw new AppError('Notification not found', 404);
        }

        await prisma.notification.delete({
            where: { id: notificationId },
        });

        return { message: 'Notification deleted' };
    }

    // Clear all notifications
    async clearAllNotifications(userId: string) {
        const result = await prisma.notification.deleteMany({
            where: { userId },
        });

        return { deleted: result.count };
    }
}

export const notificationService = new NotificationService();
