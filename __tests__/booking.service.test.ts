import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getBookingById, getUserBookingsPaginated } from '../services/booking.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

describe('Booking Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('getBookingById returns the booking with service and professional included', async () => {
    const mockBooking = { id: 'b1', userId: 'u1', service: { name: 'AC Repair' }, professional: null };
    (prisma.booking.findUnique as any).mockResolvedValue(mockBooking);

    const result = await getBookingById('b1');

    expect(prisma.booking.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'b1' } })
    );
    expect(result).toEqual(mockBooking);
  });

  it('getUserBookingsPaginated returns bookings and a total count', async () => {
    (prisma.booking.findMany as any).mockResolvedValue([{ id: 'b1' }, { id: 'b2' }]);
    (prisma.booking.count as any).mockResolvedValue(2);

    const result = await getUserBookingsPaginated('u1', 0, 10);

    expect(prisma.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 'u1' }, skip: 0, take: 10 })
    );
    expect(result.total).toBe(2);
    expect(result.bookings).toHaveLength(2);
  });
});
