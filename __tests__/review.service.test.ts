import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReviewForBooking, createReview } from '../services/review.service';
import { prisma } from '../lib/prisma';
import * as logger from '../lib/logger';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: { findUnique: vi.fn() },
    review: { findUnique: vi.fn(), create: vi.fn(), aggregate: vi.fn() },
    professional: { update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

describe('Review Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.spyOn(logger, 'logReviewSubmitted').mockImplementation(() => {});
  });

  it('getReviewForBooking looks up by the unique bookingId', async () => {
    (prisma.review.findUnique as any).mockResolvedValue(null);
    await getReviewForBooking('b1');
    expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { bookingId: 'b1' } });
  });

  it('createReview rejects a booking that is not COMPLETED', async () => {
    (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b1', userId: 'u1', status: 'CONFIRMED', professionalId: 'p1' });

    await expect(
      createReview('u1', { bookingId: 'b1', professionalId: 'p1', rating: 5 })
    ).rejects.toThrow('Only completed bookings can be reviewed.');
  });

  it('createReview rejects a booking that does not belong to the user', async () => {
    (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b1', userId: 'someone-else', status: 'COMPLETED', professionalId: 'p1' });

    await expect(
      createReview('u1', { bookingId: 'b1', professionalId: 'p1', rating: 5 })
    ).rejects.toThrow('Booking not found.');
  });

  it('createReview rejects a duplicate review for the same booking', async () => {
    (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b1', userId: 'u1', status: 'COMPLETED', professionalId: 'p1' });
    (prisma.review.findUnique as any).mockResolvedValue({ id: 'existing-review' });

    await expect(
      createReview('u1', { bookingId: 'b1', professionalId: 'p1', rating: 5 })
    ).rejects.toThrow('This booking has already been reviewed.');
  });

  it('createReview creates the review and recalculates the professional rating', async () => {
    (prisma.booking.findUnique as any).mockResolvedValue({ id: 'b1', userId: 'u1', status: 'COMPLETED', professionalId: 'p1' });
    (prisma.review.findUnique as any).mockResolvedValue(null);

    const createdReview = { id: 'r1', bookingId: 'b1', userId: 'u1', professionalId: 'p1', rating: 4 };
    (prisma.$transaction as any).mockImplementation(async (fn: any) =>
      fn({
        review: {
          create: vi.fn().mockResolvedValue(createdReview),
          aggregate: vi.fn().mockResolvedValue({ _avg: { rating: 4.5 } }),
        },
        professional: { update: vi.fn().mockResolvedValue({}) },
      })
    );

    const result = await createReview('u1', { bookingId: 'b1', professionalId: 'p1', rating: 4 });

    expect(result).toEqual(createdReview);
    expect(logger.logReviewSubmitted).toHaveBeenCalledWith('u1', 'b1', 4);
  });
});
