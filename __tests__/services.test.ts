import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globalSearch } from '../services/search.service';
import { prisma } from '../lib/prisma';

// Mock prisma
vi.mock('../lib/prisma', () => ({
  prisma: {
    service: { findMany: vi.fn() },
    professional: { findMany: vi.fn() },
    booking: { findMany: vi.fn() },
  }
}));

describe('Search Service', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('returns empty arrays when query is empty', async () => {
    const result = await globalSearch('');
    expect(result.services).toEqual([]);
    expect(result.professionals).toEqual([]);
    expect(result.bookings).toEqual([]);
  });

  it('searches correctly when query is provided', async () => {
    (prisma.service.findMany as any).mockResolvedValue([{ id: '1', name: 'Plumbing' }]);
    (prisma.professional.findMany as any).mockResolvedValue([]);
    (prisma.booking.findMany as any).mockResolvedValue([]);

    const result = await globalSearch('plumb', 'user-123');
    
    expect(prisma.service.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.professional.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.booking.findMany).toHaveBeenCalledTimes(1);
    
    expect(result.services).toHaveLength(1);
    expect(result.services[0].name).toBe('Plumbing');
  });
});
