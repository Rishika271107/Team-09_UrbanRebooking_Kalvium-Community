import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '',
  useSearchParams: () => new URLSearchParams(),
  redirect: vi.fn(),
}));

// Mock NextAuth
vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { user: { id: '1', name: 'Test User' } }, status: 'authenticated' }),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));
