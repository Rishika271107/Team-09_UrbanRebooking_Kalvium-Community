import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getDashboardAnalytics } from '../services/analytics.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: { findMany: vi.fn(), count: vi.fn() },
  },
}));

describe('Analytics Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('aggregates bookings into monthly, service-usage, and status breakdowns', async () => {
    const now = new Date();
    (prisma.booking.findMany as any).mockResolvedValue([
      { createdAt: now, status: 'COMPLETED', service: { name: 'AC Repair', price: 500 } },
      { createdAt: now, status: 'CONFIRMED', service: { name: 'AC Repair', price: 500 } },
      { createdAt: now, status: 'COMPLETED', service: { name: 'Plumbing', price: 300 } },
    ]);
    (prisma.booking.count as any).mockResolvedValue(1);

    const result = await getDashboardAnalytics('u1');

    expect(result.summary.totalBookings).toBe(3);
    expect(result.summary.totalSpent).toBe(1300);
    expect(result.serviceUsage.find((s) => s.name === 'AC Repair')?.value).toBe(2);
    expect(result.bookingStatus.find((s) => s.name === 'COMPLETED')?.value).toBe(2);
  });

  it('returns zeroed summary when the user has no bookings', async () => {
    (prisma.booking.findMany as any).mockResolvedValue([]);
    (prisma.booking.count as any).mockResolvedValue(0);

    const result = await getDashboardAnalytics('u1');

    expect(result.summary.totalBookings).toBe(0);
    expect(result.summary.totalSpent).toBe(0);
    expect(result.summary.rebookPercentage).toBe(0);
  });
});
