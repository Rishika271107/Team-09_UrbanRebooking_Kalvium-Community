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
  title: 'Booking Confirmed',
  message: 'Your booking is confirmed.',
  readStatus: false,
  createdAt: new Date(),
};

describe('Notification Service', () => {
  beforeEach(() => vi.resetAllMocks());

  it('getUserNotifications: returns user notifications ordered by date', async () => {
    (prisma.notification.findMany as any).mockResolvedValue([mockNotification]);
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(1);
    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
  });

  it('markNotificationAsRead: updates readStatus to true', async () => {
    (prisma.notification.update as any).mockResolvedValue({ ...mockNotification, readStatus: true });
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result.readStatus).toBe(true);
    expect(prisma.notification.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'notif-1', userId: 'user-1' },
        data: { readStatus: true },
      })
    );
  });

  it('markAllNotificationsAsRead: calls updateMany for user', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 3 });
    await markAllNotificationsAsRead('user-1');
    expect(prisma.notification.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1', readStatus: false } })
    );
  });

  it('deleteNotification: deletes single notification by id and userId', async () => {
    (prisma.notification.delete as any).mockResolvedValue(mockNotification);
    await deleteNotification('notif-1', 'user-1');
    expect(prisma.notification.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'notif-1', userId: 'user-1' } })
    );
  });

  it('clearAllNotifications: deletes all notifications for user', async () => {
    (prisma.notification.deleteMany as any).mockResolvedValue({ count: 5 });
    await clearAllNotifications('user-1');
    expect(prisma.notification.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'user-1' } })
    );
  });
});
