import { describe, it, expect } from 'vitest';
import { requireAuth, requireRole } from '../../server/utils/permissions';
import { H3Event } from 'h3';

describe('Permissions & Role Guards', () => {
  it('should throw 401 when context has no user', () => {
    const mockEvent = {
      context: {},
      node: { res: {} },
    } as unknown as H3Event;

    expect(() => requireAuth(mockEvent)).toThrowError(/You must be logged in/);
  });

  it('should throw 403 when user is suspended', () => {
    const mockEvent = {
      context: {
        user: {
          id: 'user-123',
          email: 'bad@actor.com',
          fullName: 'Bad Actor',
          role: 'TENANT',
          status: 'SUSPENDED',
        },
      },
      node: { res: {} },
    } as unknown as H3Event;

    expect(() => requireAuth(mockEvent)).toThrowError(/suspended/);
  });

  it('should return user context when user is authenticated and active', () => {
    const mockUser = {
      id: 'user-123',
      email: 'active@tenant.com',
      fullName: 'Active Tenant',
      role: 'TENANT' as const,
      status: 'ACTIVE',
    };
    const mockEvent = {
      context: {
        user: mockUser,
      },
      node: { res: {} },
    } as unknown as H3Event;

    const result = requireAuth(mockEvent);
    expect(result).toEqual(mockUser);
  });

  it('should allow user with matching role', () => {
    const mockLandlord = {
      id: 'landlord-456',
      email: 'landlord@domain.com',
      fullName: 'Landlord User',
      role: 'LANDLORD' as const,
      status: 'ACTIVE',
    };
    const mockEvent = {
      context: {
        user: mockLandlord,
      },
      node: { res: {} },
    } as unknown as H3Event;

    const result = requireRole(mockEvent, ['LANDLORD', 'ADMIN']);
    expect(result.role).toBe('LANDLORD');
  });

  it('should throw 403 when user role is not permitted', () => {
    const mockTenant = {
      id: 'tenant-789',
      email: 'tenant@domain.com',
      fullName: 'Tenant User',
      role: 'TENANT' as const,
      status: 'ACTIVE',
    };
    const mockEvent = {
      context: {
        user: mockTenant,
      },
      node: { res: {} },
    } as unknown as H3Event;

    expect(() => requireRole(mockEvent, ['LANDLORD', 'ADMIN'])).toThrowError(
      /Access restricted to/
    );
  });
});
