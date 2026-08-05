import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '../services/notification.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    notification: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

const mockNotification = {
  id: 'notif-1',
  userId: 'user-1',
  type: 'update',
  title: 'Booking Confirmed',
  message: 'Your booking is confirmed.',
  iconName: 'bell',
  readStatus: false,
  createdAt: new Date(),
};

describe('Notification Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getUserNotifications: returns empty array when no notifications', async () => {
    (prisma.notification.findMany as any).mockResolvedValue([]);
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(0);
    expect(prisma.notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('getUserNotifications: returns notifications for a user', async () => {
    (prisma.notification.findMany as any).mockResolvedValue([mockNotification]);
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Booking Confirmed');
  });

  it('markNotificationAsRead: returns null when notification not found', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue(null);
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('markNotificationAsRead: returns null when userId does not match', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue({ ...mockNotification, userId: 'other-user' });
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('markNotificationAsRead: marks notification as read for correct user', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue(mockNotification);
    (prisma.notification.update as any).mockResolvedValue({ ...mockNotification, readStatus: true });
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result?.readStatus).toBe(true);
  });

  it('markAllNotificationsAsRead: calls updateMany and returns count', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 3 });
    const result = await markAllNotificationsAsRead('user-1');
    expect(result).toEqual({ count: 3 });
    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readStatus: false },
      data: { readStatus: true },
    });
  });

  it('markAllNotificationsAsRead: returns count of 0 when nothing to update', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 0 });
    const result = await markAllNotificationsAsRead('user-1');
    expect(result).toEqual({ count: 0 });
  });

  it('deleteNotification: returns null when notification not found', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue(null);
    const result = await deleteNotification('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('deleteNotification: returns null when userId does not match', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue({ ...mockNotification, userId: 'other-user' });
    const result = await deleteNotification('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('deleteNotification: deletes notification for correct user', async () => {
    (prisma.notification.findUnique as any).mockResolvedValue(mockNotification);
    (prisma.notification.delete as any).mockResolvedValue(mockNotification);
    const result = await deleteNotification('notif-1', 'user-1');
    expect(result?.id).toBe('notif-1');
    expect(prisma.notification.delete).toHaveBeenCalledWith({ where: { id: 'notif-1' } });
  });

  it('clearAllNotifications: deletes all notifications for user and returns count', async () => {
    (prisma.notification.deleteMany as any).mockResolvedValue({ count: 5 });
    const result = await clearAllNotifications('user-1');
    expect(result).toEqual({ count: 5 });
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });

  it('clearAllNotifications: returns count of 0 when no notifications exist', async () => {
    (prisma.notification.deleteMany as any).mockResolvedValue({ count: 0 });
    const result = await clearAllNotifications('user-1');
    expect(result).toEqual({ count: 0 });
  });
});