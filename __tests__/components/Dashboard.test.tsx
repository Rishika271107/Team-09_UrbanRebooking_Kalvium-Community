import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DashboardClient from '@/app/dashboard/DashboardClient';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/components/ErrorComponents', () => ({
  toast: vi.fn(),
}));

// Mock heavy dashboard sub-components to keep tests focused
vi.mock('@/components/dashboard/WelcomeBanner', () => ({
  WelcomeBanner: ({ firstName }: { firstName: string }) => (
    <div data-testid="welcome-banner">Welcome, {firstName}</div>
  ),
}));

vi.mock('@/components/dashboard/StatsCard', () => ({
  StatsCard: ({ stat }: { stat: any }) => (
    <div data-testid="stats-card">{stat.label}: {stat.value}</div>
  ),
}));

vi.mock('@/components/dashboard/QuickRebookCard', () => ({
  QuickRebookCard: ({ item }: { item: any }) => (
    <div data-testid="rebook-card">{item.serviceName}</div>
  ),
}));

vi.mock('@/components/dashboard/UpcomingServices', () => ({
  UpcomingServices: ({ services }: { services: any[] }) => (
    <div data-testid="upcoming-services">
      {services.map((s) => <div key={s.id}>{s.serviceName}</div>)}
    </div>
  ),
}));

vi.mock('@/components/dashboard/RecentActivity', () => ({
  RecentActivity: ({ activities }: { activities: any[] }) => (
    <div data-testid="recent-activity">
      {activities.map((a) => <div key={a.id}>{a.description}</div>)}
    </div>
  ),
}));

vi.mock('@/components/dashboard/QuickActions', () => ({
  QuickActions: () => <div data-testid="quick-actions">Quick Actions</div>,
}));

vi.mock('@/components/dashboard/RecommendedServices', () => ({
  RecommendedServices: ({ services }: { services: any[] }) => (
    <div data-testid="recommended-services">
      {services.map((s) => <div key={s.id}>{s.name}</div>)}
    </div>
  ),
}));

vi.mock('@/components/dashboard/ServiceCategoryCard', () => ({
  ServiceCategoryCard: ({ category }: { category: any }) => (
    <div data-testid="category-card">{category.name}</div>
  ),
}));

vi.mock('@/components/dashboard/SkeletonLoaders', () => ({
  StatsSkeleton: () => <div data-testid="stats-skeleton">Loading Stats...</div>,
  QuickRebookSkeleton: () => <div data-testid="rebook-skeleton">Loading Rebooks...</div>,
  RecentActivitySkeleton: () => <div data-testid="activity-skeleton">Loading Activity...</div>,
}));

vi.mock('@/components/ui', () => ({
  Modal: ({ children, isOpen }: { children: React.ReactNode; isOpen: boolean }) =>
    isOpen ? <div data-testid="modal">{children}</div> : null,
  Avatar: ({ name }: { name: string }) => <div data-testid="avatar">{name}</div>,
  RatingStars: ({ rating }: { rating: number }) => <div data-testid="rating">{rating}</div>,
}));

const mockProfile = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  phone: null,
  address: null,
};

const mockBookings = [
  {
    id: 'booking-1',
    status: 'COMPLETED',
    slotStart: '2026-07-10T10:00:00Z',
    slotEnd: '2026-07-10T11:00:00Z',
    address: '123 Main St',
    eligibleForRebook: true,
    price: 150,
    service: { id: 's1', name: 'AC Repair', price: 150, durationMinutes: 60 },
    professional: { id: 'p1', active: true, user: { name: 'John Doe' } },
  },
];

const mockDashboardData = {
  favoriteProfessionals: [],
  trendingServices: [
    { id: 'svc-1', name: 'Plumbing', category: 'Repair', price: 100, rating: 4.5, image: '' },
  ],
  categories: ['Cleaning', 'Repair'],
  crossSells: [],
  recommendedServices: [
    { id: 'rec-1', name: 'Electrician', category: 'Repair', price: 120, rating: 4.3, image: '' },
  ],
};

describe('DashboardClient', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });

    // Mock all three API calls
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url === '/api/customers/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockProfile }),
        } as Response);
      }
      if (url === '/api/bookings/history') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ bookings: mockBookings }),
        } as Response);
      }
      if (url === '/api/dashboard') {
        return Promise.resolve({
          ok: true,
          json: async () => mockDashboardData,
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => ({}) } as Response);
    });
  });

  it('shows loading skeletons initially', () => {
    render(<DashboardClient userName="Test User" />);
    expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('rebook-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('activity-skeleton')).toBeInTheDocument();
  });

  it('renders dashboard data after loading', async () => {
    render(<DashboardClient userName="Test User" />);

    await waitFor(() => {
      expect(screen.getByTestId('welcome-banner')).toBeInTheDocument();
    });

    // DashboardClient passes firstName = userName.split(' ')[0] so 'Test User' -> 'Test'
    expect(screen.getByTestId('welcome-banner').textContent).toContain('Test');
  });

  it('renders quick rebook card for eligible bookings', async () => {
    render(<DashboardClient userName="Test User" />);

    await waitFor(() => {
      expect(screen.queryByTestId('rebook-skeleton')).not.toBeInTheDocument();
    });

    expect(screen.getByTestId('rebook-card')).toBeInTheDocument();
    expect(screen.getByText('AC Repair')).toBeInTheDocument();
  });

  it('renders recommended services after data loads', async () => {
    render(<DashboardClient userName="Test User" />);

    await waitFor(() => {
      expect(screen.getByTestId('recommended-services')).toBeInTheDocument();
    });

    expect(screen.getByText('Electrician')).toBeInTheDocument();
  });

  it('shows empty rebook section when no eligible bookings', async () => {
    // Override with no rebook-eligible bookings
    (global.fetch as any).mockImplementation((url: string) => {
      if (url === '/api/bookings/history') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ bookings: [] }),
        } as Response);
      }
      if (url === '/api/customers/me') {
        return Promise.resolve({
          ok: true,
          json: async () => ({ user: mockProfile }),
        } as Response);
      }
      return Promise.resolve({ ok: true, json: async () => mockDashboardData } as Response);
    });

    render(<DashboardClient userName="Test User" />);

    await waitFor(() => {
      expect(screen.queryByTestId('rebook-skeleton')).not.toBeInTheDocument();
    });

    // No rebook cards should be visible
    expect(screen.queryByTestId('rebook-card')).not.toBeInTheDocument();
  });
});
