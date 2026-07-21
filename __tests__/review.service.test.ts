import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReviewForBooking, createReview } from '../services/review.service';
import { prisma } from '../lib/prisma';
import * as logger from '../lib/logger';

vi.mock('../lib/prisma', () => ({
  prisma: {
    booking: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
    review: {
      create: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    professional: {
      update: vi.fn(),
    },
  },
}));

vi.mock('../lib/logger', () => ({
  logReviewSubmitted: vi.fn(),
  logDbError: vi.fn(),
}));

describe('Review Service', () => {
  beforeEach(() => vi.resetAllMocks());

  describe('getReviewForBooking', () => {
    it('returns review for a given bookingId', async () => {
      const mockReview = { id: 'rev-1', bookingId: 'bk-1', rating: 5 };
      (prisma.review.findUnique as any).mockResolvedValue(mockReview);

      const result = await getReviewForBooking('bk-1');
      expect(result).toEqual(mockReview);
      expect(prisma.review.findUnique).toHaveBeenCalledWith({ where: { bookingId: 'bk-1' } });
    });

    it('returns null when no review exists', async () => {
      (prisma.review.findUnique as any).mockResolvedValue(null);
      const result = await getReviewForBooking('bk-none');
      expect(result).toBeNull();
    });
  });

  describe('createReview', () => {
    const reviewData = {
      professionalId: 'pro-1',
      bookingId: 'bk-1',
      rating: 4,
      reviewText: 'Great service!',
    };

    it('throws if booking is not completed', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'bk-1', status: 'UPCOMING' });

      await expect(createReview('user-1', reviewData)).rejects.toThrow(
        'Only completed bookings can be reviewed.'
      );
    });

    it('throws if booking does not exist', async () => {
      (prisma.booking.findUnique as any).mockResolvedValue(null);

      await expect(createReview('user-1', reviewData)).rejects.toThrow(
        'Only completed bookings can be reviewed.'
      );
    });

    it('creates review and recalculates rating for completed booking', async () => {
      const mockReview = { id: 'rev-1', ...reviewData, userId: 'user-1' };
      (prisma.booking.findUnique as any).mockResolvedValue({ id: 'bk-1', status: 'COMPLETED' });
      (prisma.review.create as any).mockResolvedValue(mockReview);
      (prisma.review.findMany as any).mockResolvedValue([{ rating: 4 }, { rating: 5 }]);
      (prisma.booking.count as any).mockResolvedValue(10);
      (prisma.professional.update as any).mockResolvedValue({});

      const result = await createReview('user-1', reviewData);

      expect(result.id).toBe('rev-1');
      expect(prisma.professional.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'pro-1' },
          data: { rating: 4.5, jobsCompleted: 10 },
        })
      );
      expect(logger.logReviewSubmitted).toHaveBeenCalledWith('user-1', 'bk-1', 4);
    });
  });
});
