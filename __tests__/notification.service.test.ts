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
      update: vi.fn(),
      updateMany: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
      create: vi.fn(),
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
    ((prisma as any).notification.findMany as any).mockResolvedValue([]);
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(0);
    expect((prisma as any).notification.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
    });
  });

  it('getUserNotifications: returns notifications for a user', async () => {
    ((prisma as any).notification.findMany as any).mockResolvedValue([mockNotification]);
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Booking Confirmed');
  });

  it('markNotificationAsRead: throws error when notification not found', async () => {
    ((prisma as any).notification.updateMany as any).mockResolvedValue({ count: 0 });
    await expect(markNotificationAsRead('notif-1', 'user-1')).rejects.toThrow("Notification not found.");
  });

  it('markNotificationAsRead: throws error when userId does not match', async () => {
    ((prisma as any).notification.updateMany as any).mockResolvedValue({ count: 0 });
    await expect(markNotificationAsRead('notif-1', 'user-1')).rejects.toThrow("Notification not found.");
  });

  it('markNotificationAsRead: marks notification as read for correct user', async () => {
    ((prisma as any).notification.updateMany as any).mockResolvedValue({ count: 1 });
    ((prisma as any).notification.findUnique as any).mockResolvedValue({ ...mockNotification, readStatus: true });
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result?.readStatus).toBe(true);
  });

  it('markAllNotificationsAsRead: calls updateMany and returns count', async () => {
    ((prisma as any).notification.updateMany as any).mockResolvedValue({ count: 3 });
    const result = await markAllNotificationsAsRead('user-1');
    expect(result).toEqual({ count: 3 });
    expect((prisma as any).notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', readStatus: false },
      data: { readStatus: true },
    });
  });

  it('markAllNotificationsAsRead: returns count of 0 when nothing to update', async () => {
    ((prisma as any).notification.updateMany as any).mockResolvedValue({ count: 0 });
    const result = await markAllNotificationsAsRead('user-1');
    expect(result).toEqual({ count: 0 });
  });

  it('deleteNotification: throws error when notification not found', async () => {
    ((prisma as any).notification.deleteMany as any).mockResolvedValue({ count: 0 });
    await expect(deleteNotification('notif-1', 'user-1')).rejects.toThrow("Notification not found.");
  });

  it('deleteNotification: throws error when userId does not match', async () => {
    ((prisma as any).notification.deleteMany as any).mockResolvedValue({ count: 0 });
    await expect(deleteNotification('notif-1', 'user-1')).rejects.toThrow("Notification not found.");
  });

  it('deleteNotification: deletes notification for correct user', async () => {
    ((prisma as any).notification.deleteMany as any).mockResolvedValue({ count: 1 });
    const result = await deleteNotification('notif-1', 'user-1');
    expect(result?.id).toBe('notif-1');
    expect((prisma as any).notification.deleteMany).toHaveBeenCalledWith({ where: { id: 'notif-1', userId: 'user-1' } });
  });

  it('clearAllNotifications: deletes all notifications for user and returns count', async () => {
    ((prisma as any).notification.deleteMany as any).mockResolvedValue({ count: 5 });
    const result = await clearAllNotifications('user-1');
    expect(result).toEqual({ count: 5 });
    expect((prisma as any).notification.deleteMany).toHaveBeenCalledWith({ where: { userId: 'user-1' } });
  });

  it('clearAllNotifications: returns count of 0 when no notifications exist', async () => {
    ((prisma as any).notification.deleteMany as any).mockResolvedValue({ count: 0 });
    const result = await clearAllNotifications('user-1');
    expect(result).toEqual({ count: 0 });
  });
});