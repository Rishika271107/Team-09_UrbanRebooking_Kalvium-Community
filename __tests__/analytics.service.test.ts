import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardAnalytics } from '../services/analytics.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
    },
    rebookHistory: {
      count: vi.fn(),
    },
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns zero summary when user has no bookings', async () => {
    (prisma.booking.findMany as any).mockResolvedValue([]);
    (prisma.rebookHistory.count as any).mockResolvedValue(0);

    const result = await getDashboardAnalytics('user-empty');
    expect(result.summary.totalBookings).toBe(0);
    expect(result.summary.totalSpent).toBe(0);
    expect(result.summary.rebookPercentage).toBe(0);
    expect(result.monthlyBookings).toEqual([]);
    expect(result.serviceUsage).toEqual([]);
  });

  it('correctly calculates totals and distributions', async () => {
    const bookings = [
      {
        id: 'bk-1',
        status: 'COMPLETED',
        price: 100,
        createdAt: new Date('2026-01-15'),
        service: { name: 'Plumbing' },
        payment: null,
      },
      {
        id: 'bk-2',
        status: 'UPCOMING',
        price: 200,
        createdAt: new Date('2026-01-20'),
        service: { name: 'Plumbing' },
        payment: null,
      },
      {
        id: 'bk-3',
        status: 'COMPLETED',
        price: 150,
        createdAt: new Date('2026-02-10'),
        service: { name: 'Electrical' },
        payment: null,
      },
    ];
    (prisma.booking.findMany as any).mockResolvedValue(bookings);
    (prisma.rebookHistory.count as any).mockResolvedValue(1);

    const result = await getDashboardAnalytics('user-1');

    expect(result.summary.totalBookings).toBe(3);
    expect(result.summary.totalSpent).toBe(450);
    expect(result.summary.rebookPercentage).toBe(33); // 1/3 = 33%

    // Status distribution: 2 COMPLETED, 1 UPCOMING
    const completedEntry = result.bookingStatus.find(s => s.name === 'Completed');
    const upcomingEntry = result.bookingStatus.find(s => s.name === 'Upcoming');
    expect(completedEntry?.value).toBe(2);
    expect(upcomingEntry?.value).toBe(1);

    // Service usage: Plumbing x2, Electrical x1
    expect(result.serviceUsage[0].name).toBe('Plumbing');
    expect(result.serviceUsage[0].value).toBe(2);
  });
});
