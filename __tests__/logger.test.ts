import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logAuthSignIn, logAuthSignUp, logAuthFailure, logRebookCreated, logReviewSubmitted, logDbError, logUnexpectedError } from '../lib/logger';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('logAuthSignIn outputs info level JSON', () => {
    logAuthSignIn('user-1', 'test@example.com');
    expect(console.log).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse((console.log as any).mock.calls[0][0]);
    expect(parsed.level).toBe('info');
    expect(parsed.event).toBe('auth.sign_in');
    expect(parsed.userId).toBe('user-1');
    expect(parsed.email).toBe('test@example.com');
  });

  it('logAuthFailure outputs warn level JSON', () => {
    logAuthFailure('bad@user.com', 'wrong_password');
    expect(console.warn).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse((console.warn as any).mock.calls[0][0]);
    expect(parsed.level).toBe('warn');
    expect(parsed.event).toBe('auth.failure');
    // IMPORTANT: no password in logs
    expect(parsed).not.toHaveProperty('password');
  });

  it('logUnexpectedError outputs error level with stack', () => {
    const err = new Error('Test error');
    logUnexpectedError('testContext', err);
    expect(console.error).toHaveBeenCalledTimes(1);
    const parsed = JSON.parse((console.error as any).mock.calls[0][0]);
    expect(parsed.level).toBe('error');
    expect(parsed.context).toBe('testContext');
    expect(parsed.message).toBe('Test error');
    expect(parsed.stack).toBeDefined();
  });

  it('logDbError does not expose sensitive data', () => {
    logDbError('prisma.user.create', new Error('Connection refused'));
    const parsed = JSON.parse((console.error as any).mock.calls[0][0]);
    expect(parsed.operation).toBe('prisma.user.create');
    expect(parsed).not.toHaveProperty('password');
    expect(parsed).not.toHaveProperty('token');
  });
});
