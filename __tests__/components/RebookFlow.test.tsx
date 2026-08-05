import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import RebookFormClient from '@/app/rebook/[id]/RebookFormClient';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/actions/booking.actions', () => ({
  rebookAction: vi.fn(),
}));

vi.mock('@/components/ErrorComponents', () => ({
  toast: vi.fn(),
}));

// Mock all rebook sub-components to isolate the form logic
vi.mock('@/components/rebook/BookingSummary', () => ({
  BookingSummary: ({ serviceName }: { serviceName: string }) => (
    <div data-testid="booking-summary">{serviceName} Summary</div>
  ),
}));

vi.mock('@/components/rebook/ProfessionalCard', () => ({
  ProfessionalCard: ({ professionalName }: { professionalName: string }) => (
    <div data-testid="professional-card">{professionalName}</div>
  ),
}));

vi.mock('@/components/rebook/SlotCalendar', () => ({
  SlotCalendar: ({
    onDateSelect,
    onTimeSelect,
  }: {
    onDateSelect: (d: string) => void;
    onTimeSelect: (t: string) => void;
  }) => (
    <div data-testid="slot-calendar">
      <button onClick={() => onDateSelect('2026-08-10')}>Select Date</button>
      <button onClick={() => onTimeSelect('10:00 AM')}>Select Time</button>
    </div>
  ),
}));

vi.mock('@/components/rebook/ConfirmationCard', () => ({
  ConfirmationCard: () => <div data-testid="confirmation-card">Confirmation Details</div>,
}));

vi.mock('@/components/rebook/PriceBreakdown', () => ({
  PriceBreakdown: () => <div data-testid="price-breakdown">Price Breakdown</div>,
}));

const defaultProps = {
  originalBookingId: 'booking-1',
  addresses: [
    {
      id: 'addr-1',
      addressLine: '123 Main St',
      city: 'Mumbai',
      state: 'MH',
      pincode: '400001',
      isDefault: true,
    },
  ],
  serviceName: 'AC Repair',
  servicePrice: 150,
  professionalName: 'John Doe',
  isProfessionalActive: true,
};

describe('RebookFormClient', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('renders Step 1 (Professional) by default', () => {
    render(<RebookFormClient {...defaultProps} />);

    // Booking summary is always shown
    expect(screen.getByTestId('booking-summary')).toBeInTheDocument();
    expect(screen.getByText('AC Repair Summary')).toBeInTheDocument();

    // Step stepper labels
    expect(screen.getByText('Professional')).toBeInTheDocument();
    expect(screen.getByText('Schedule')).toBeInTheDocument();
    expect(screen.getByText('Review')).toBeInTheDocument();

    // Professional card shown in step 1
    expect(screen.getByTestId('professional-card')).toBeInTheDocument();
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('advances to Step 2 (Schedule) when Continue is clicked on Step 1', async () => {
    render(<RebookFormClient {...defaultProps} />);

    const nextButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      // SlotCalendar should now be visible
      expect(screen.getByTestId('slot-calendar')).toBeInTheDocument();
    });
  });

  it('selects a date and time slot in Step 2', async () => {
    render(<RebookFormClient {...defaultProps} />);

    // Move to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));

    await waitFor(() => {
      expect(screen.getByTestId('slot-calendar')).toBeInTheDocument();
    });

    // Select a date and time via the mocked SlotCalendar
    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    fireEvent.click(screen.getByRole('button', { name: /select time/i }));

    // Continue to Step 3
    const nextButton = screen.getByRole('button', { name: /continue/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByTestId('confirmation-card')).toBeInTheDocument();
    });
  });

  it('navigates back to Step 1 from Step 2', async () => {
    render(<RebookFormClient {...defaultProps} />);

    // Go to Step 2
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByTestId('slot-calendar')).toBeInTheDocument();
    });

    // Go back
    const backButton = screen.getByRole('button', { name: /back/i });
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('professional-card')).toBeInTheDocument();
    });
  });

  it('shows confirmation step with price breakdown on Step 3', async () => {
    render(<RebookFormClient {...defaultProps} />);

    // Move through steps
    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => screen.getByTestId('slot-calendar'));

    fireEvent.click(screen.getByRole('button', { name: /select date/i }));
    fireEvent.click(screen.getByRole('button', { name: /select time/i }));

    fireEvent.click(screen.getByRole('button', { name: /continue/i }));
    await waitFor(() => {
      expect(screen.getByTestId('confirmation-card')).toBeInTheDocument();
      expect(screen.getByTestId('price-breakdown')).toBeInTheDocument();
    });
  });
});
