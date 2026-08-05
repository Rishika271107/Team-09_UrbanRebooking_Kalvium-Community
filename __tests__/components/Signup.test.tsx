import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import SignupPage from '@/app/signup/page';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/lib/actions';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/lib/actions', () => ({
  registerUser: vi.fn(),
}));

vi.mock('next-auth/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('next-auth/react')>();
  return {
    ...actual,
    signIn: vi.fn().mockResolvedValue({ ok: true, error: null }),
  };
});

describe('SignupPage', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({ push: mockPush });
  });

  it('renders signup form correctly', () => {
    render(<SignupPage />);
    expect(screen.getByText('Create your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('customer@urban.co')).toBeInTheDocument();
  });

  it('validates required fields', async () => {
    render(<SignupPage />);
    const submitButton = screen.getByRole('button', { name: /create account/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Full name is required.')).toBeInTheDocument();
      expect(screen.getByText('Email is required.')).toBeInTheDocument();
    });
  });

  it('validates password match', async () => {
    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('Create password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password456' } });
    
    fireEvent.click(screen.getByRole('checkbox')); // Agree to terms
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
    });
  });

  it('handles successful registration', async () => {
    (registerUser as any).mockResolvedValueOnce({ error: null });

    render(<SignupPage />);
    fireEvent.change(screen.getByPlaceholderText('Enter your full name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('customer@urban.co'), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('+91 XXXXX XXXXX'), { target: { value: '1234567890' } });
    
    fireEvent.change(screen.getByPlaceholderText('Create password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('Confirm password'), { target: { value: 'password123' } });
    
    fireEvent.click(screen.getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(registerUser).toHaveBeenCalledWith(expect.objectContaining({
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        phone: '1234567890',
        password: 'password123',
      }));
      expect(screen.getByText('Account created!')).toBeInTheDocument();
    });
  });
});
