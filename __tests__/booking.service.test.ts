import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getUserBookings,
  getBookingById,
  getUserBookingsPaginated,
} from '../services/booking.service';
import { prisma } from '../lib/prisma';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

const mockBooking = {
  id: 'bk-1',
  customerId: 'user-1',
  serviceId: 'svc-1',
  professionalId: 'pro-1',
  addressId: 'addr-1',
  date: '2026-07-20',
  time: '10:00 AM',
  status: 'COMPLETED',
  price: 150,
  createdAt: new Date(),
  service: { id: 'svc-1', name: 'Plumbing' },
  professional: { id: 'pro-1', name: 'John Doe', avatar: '' },
  address: { addressLine: '123 Main St', city: 'Anytown', state: 'CA', pincode: '12345' },
  payment: null,
  customer: { id: 'user-1', name: 'Test User', email: 'test@example.com' },
};

describe('Booking Service', () => {
  beforeEach(() => vi.resetAllMocks());

  describe('getUserBookings', () => {
    it('returns bookings for a user', async () => {
      (prisma.booking.findMany as any).mockResolvedValue([mockBooking]);
      const result = await getUserBookings('user-1');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('bk-1');
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { customerId: 'user-1' } })
      );
    });

    it('returns empty array when no bookings exist', async () => {
      (prisma.booking.findMany as any).mockResolvedValue([]);
      const result = await getUserBookings('user-none');
      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('returns a booking when found', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue(mockBooking);
      const result = await getBookingById('bk-1');
      expect(result).not.toBeNull();
      expect(result?.id).toBe('bk-1');
    });

    it('returns null when booking not found', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue(null);
      const result = await getBookingById('nonexistent');
      expect(result).toBeNull();
    });
  });

  describe('getUserBookingsPaginated', () => {
    it('passes correct skip and take to prisma', async () => {
      (prisma.booking.findMany as any).mockResolvedValue([mockBooking]);
      await getUserBookingsPaginated('user-1', 10, 5);
      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 5 })
      );
    });
  });
});
