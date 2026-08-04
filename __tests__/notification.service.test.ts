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
      updateMany: vi.fn(),
      deleteMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

describe('Notification Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getUserNotifications orders by createdAt desc', async () => {
    (prisma.notification.findMany as any).mockResolvedValue([]);

    await getUserNotifications('u1');

    expect(prisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'u1' },
        orderBy: { createdAt: 'desc' },
      })
    );
  });

  it('markNotificationAsRead throws when the notification does not belong to the user', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 0 });

    await expect(
      markNotificationAsRead('n1', 'u1')
    ).rejects.toThrow('Notification not found.');
  });

  it('markNotificationAsRead updates when ownership matches', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 1 });
    (prisma.notification.findUnique as any).mockResolvedValue({
      id: 'n1',
      readStatus: true,
    });

    const result = await markNotificationAsRead('n1', 'u1');

    expect(result).toEqual({
      id: 'n1',
      readStatus: true,
    });
  });

  it('markAllNotificationsAsRead scopes to unread notifications for the user', async () => {
    (prisma.notification.updateMany as any).mockResolvedValue({ count: 3 });

    await markAllNotificationsAsRead('u1');

    expect(prisma.notification.updateMany).toHaveBeenCalledWith({
      where: {
        userId: 'u1',
        readStatus: false,
      },
      data: {
        readStatus: true,
      },
    });
  });

  it('deleteNotification throws when not owned by the user', async () => {
    (prisma.notification.deleteMany as any).mockResolvedValue({ count: 0 });

    await expect(
      deleteNotification('n1', 'u1')
    ).rejects.toThrow('Notification not found.');
  });

  it('clearAllNotifications deletes every notification for the user', async () => {
    (prisma.notification.deleteMany as any).mockResolvedValue({ count: 5 });

    await clearAllNotifications('u1');

    expect(prisma.notification.deleteMany).toHaveBeenCalledWith({
      where: {
        userId: 'u1',
      },
    });
  });
});