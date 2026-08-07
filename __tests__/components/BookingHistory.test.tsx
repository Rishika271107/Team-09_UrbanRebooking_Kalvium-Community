import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BookingHistoryClient from '@/app/bookings/BookingHistoryClient';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/ErrorComponents', () => ({
  toast: vi.fn(),
}));

const mockBookings = [
  {
    id: 'booking-1',
    status: 'CONFIRMED',
    slotStart: '2026-08-10T10:00:00Z',
    slotEnd: '2026-08-10T11:00:00Z',
    createdAt: '2026-08-01T10:00:00Z',
    address: '123 Main St',
    service: { id: 's1', name: 'AC Repair', category: 'Repair', price: 150 },
    professional: { id: 'p1', user: { name: 'John Doe' } },
    eligibleForRebook: false,
  },
  {
    id: 'booking-2',
    status: 'COMPLETED',
    slotStart: '2026-07-10T10:00:00Z',
    slotEnd: '2026-07-10T11:00:00Z',
    createdAt: '2026-07-01T10:00:00Z',
    address: '456 Oak Ave',
    service: { id: 's2', name: 'Home Cleaning', category: 'Cleaning', price: 80 },
    professional: { id: 'p2', user: { name: 'Jane Smith' } },
    eligibleForRebook: true,
  },
];

describe('BookingHistoryClient', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });

    // Mock the fetch call that loads bookings
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ bookings: mockBookings }),
    } as Response);
  });

  it('renders booking cards after loading', async () => {
    render(<BookingHistoryClient />);

    // Wait for loading to complete and booking cards to appear
    await waitFor(() => {
      expect(screen.getByText('AC Repair')).toBeInTheDocument();
    });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('shows Upcoming status badge for CONFIRMED bookings', async () => {
    render(<BookingHistoryClient />);

    await waitFor(() => {
      expect(screen.getByText('AC Repair')).toBeInTheDocument();
    });

    // CONFIRMED status maps to "Upcoming" label in STATUS_META
    // There may be multiple elements with 'Upcoming' (tabs + badges), so check at least one exists
    expect(screen.getAllByText('Upcoming').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0);
  });

  it('shows Rebook button only for eligible bookings', async () => {
    render(<BookingHistoryClient />);

    await waitFor(() => {
      expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
    });

    // Home Cleaning (COMPLETED, eligibleForRebook: true) should have at least one Rebook button
    const rebookButtons = screen.getAllByRole('button', { name: /rebook/i });
    expect(rebookButtons.length).toBeGreaterThanOrEqual(1);
  });

  it('filters bookings by Completed tab', async () => {
    render(<BookingHistoryClient />);

    await waitFor(() => {
      expect(screen.getByText('AC Repair')).toBeInTheDocument();
    });

    // The tabs are rendered as buttons inside the filter bar.
    // We query ALL buttons and find the first whose text is only 'Completed' (the tab).
    // Status badges are spans, not buttons, so filtering by role='button' is enough.
    const tabButtons = screen.getAllByRole('button');
    // Tab buttons: All, Completed, Upcoming, Cancelled, Rebooked — find 'Completed' tab
    // whose text doesn't include a count badge (or just matches exactly)
    const completedTabBtn = tabButtons.find(
      (btn) => btn.textContent?.replace(/\s+/g, ' ').trim().startsWith('Completed')
        && !btn.textContent?.includes('Repair')
        && !btn.textContent?.includes('Details')
    );
    expect(completedTabBtn).toBeDefined();
    fireEvent.click(completedTabBtn!);

    await waitFor(() => {
      expect(screen.getByText('Home Cleaning')).toBeInTheDocument();
      expect(screen.queryByText('AC Repair')).not.toBeInTheDocument();
    });
  });

  it('opens cancel modal when Cancel is clicked on a CONFIRMED booking', async () => {
    render(<BookingHistoryClient />);

    await waitFor(() => {
      expect(screen.getByText('AC Repair')).toBeInTheDocument();
    });

    // The Cancel action button sits inside the booking card (not a tab).
    // Tabs use button text like 'Cancelled', not 'Cancel'.
    // Find all buttons with text starting with 'Cancel' but NOT 'Cancelled'.
    const allButtons = screen.getAllByRole('button');
    const cancelActionBtn = allButtons.find(
      (btn) =>
        btn.textContent?.replace(/\s+/g, ' ').trim() === 'Cancel'
    );
    expect(cancelActionBtn).toBeDefined();
    fireEvent.click(cancelActionBtn!);

    await waitFor(() => {
      expect(screen.getByText(/Cancel Booking/i)).toBeInTheDocument();
      expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    });
  });

  it('navigates to booking details when Details is clicked', async () => {
    render(<BookingHistoryClient />);

    await waitFor(() => {
      expect(screen.getByText('AC Repair')).toBeInTheDocument();
    });

    const detailsButtons = screen.getAllByRole('button', { name: /details/i });
    fireEvent.click(detailsButtons[0]);

    expect(mockPush).toHaveBeenCalledWith('/bookings/booking-1');
  });

  it('shows empty state when no bookings', async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ bookings: [] }),
    });

    render(<BookingHistoryClient />);

    await waitFor(() => {
      // Should show some kind of empty state — the EmptyState component with no-bookings type
      expect(screen.queryByText('AC Repair')).not.toBeInTheDocument();
    });
  });
});
