import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardAnalytics } from '../services/analytics.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
    },
    rebookingEvent: {
      count: vi.fn(),
    },
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => vi.resetAllMocks());

  it('returns zero summary when user has no bookings', async () => {
    (prisma.booking.findMany as any).mockResolvedValue([]);
    (prisma.rebookingEvent.count as any).mockResolvedValue(0);

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
        service: { name: 'Plumbing', price: 100 },
        payment: null,
      },
      {
        id: 'bk-2',
        status: 'PENDING',
        price: 200,
        createdAt: new Date('2026-01-20'),
        service: { name: 'Plumbing', price: 200 },
        payment: null,
      },
      {
        id: 'bk-3',
        status: 'COMPLETED',
        price: 150,
        createdAt: new Date('2026-02-10'),
        service: { name: 'Electrical', price: 150 },
        payment: null,
      },
    ];

    (prisma.booking.findMany as any).mockResolvedValue(bookings);
    (prisma.rebookingEvent.count as any).mockResolvedValue(1);

    const result = await getDashboardAnalytics('u1');

    expect(result.summary.totalBookings).toBe(3);
    expect(result.summary.totalSpent).toBe(450);
    expect(result.summary.rebookPercentage).toBeCloseTo(33.33, 1);

    expect(result.serviceUsage.find(s => s.name === 'Plumbing')?.value).toBe(2);
    expect(result.serviceUsage.find(s => s.name === 'Electrical')?.value).toBe(1);

    const completedEntry = result.bookingStatus.find(s => s.name === 'Completed');
    const pendingEntry = result.bookingStatus.find(s => s.name === 'Pending');

    expect(completedEntry?.value).toBe(2);
    expect(pendingEntry?.value).toBe(1);
  });

  it('aggregates bookings into monthly, service-usage, and status breakdowns', async () => {
    const now = new Date();

    (prisma.booking.findMany as any).mockResolvedValue([
      {
        createdAt: now,
        status: 'COMPLETED',
        service: { name: 'AC Repair', price: 500 },
        price: 500,
        payment: null,
      },
      {
        createdAt: now,
        status: 'CONFIRMED',
        service: { name: 'AC Repair', price: 500 },
        price: 500,
        payment: null,
      },
      {
        createdAt: now,
        status: 'COMPLETED',
        service: { name: 'Plumbing', price: 300 },
        price: 300,
        payment: null,
      },
    ]);

    (prisma.rebookingEvent.count as any).mockResolvedValue(1);

    const result = await getDashboardAnalytics('u1');

    expect(result.summary.totalBookings).toBe(3);
    expect(result.summary.totalSpent).toBe(1300);

    expect(
      result.serviceUsage.find(s => s.name === 'AC Repair')?.value
    ).toBe(2);

    expect(
      result.bookingStatus.find(s => s.name === 'Completed')?.value
    ).toBe(2);
  });
});
