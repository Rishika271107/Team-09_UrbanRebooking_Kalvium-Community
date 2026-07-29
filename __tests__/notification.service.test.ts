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

  it('getUserNotifications: returns empty array', async () => {
    const result = await getUserNotifications('user-1');
    expect(result).toHaveLength(0);
  });

  it('markNotificationAsRead: returns null', async () => {
    const result = await markNotificationAsRead('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('markAllNotificationsAsRead: calls updateMany for user', async () => {
    const result = await markAllNotificationsAsRead('user-1');
    expect(result).toEqual({ count: 0 });
  });

  it('deleteNotification: deletes single notification by id and userId', async () => {
    const result = await deleteNotification('notif-1', 'user-1');
    expect(result).toBeNull();
  });

  it('clearAllNotifications: deletes all notifications for user', async () => {
    const result = await clearAllNotifications('user-1');
    expect(result).toEqual({ count: 0 });
  });
});
