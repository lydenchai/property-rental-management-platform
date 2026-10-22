import { describe, it, expect } from 'vitest';
import { RegisterInputSchema, LoginInputSchema } from '../../shared/schemas/auth.schema';
import { CreatePropertySchema, CreateUnitSchema } from '../../shared/schemas/property.schema';
import { CreateMaintenanceRequestSchema } from '../../shared/schemas/maintenance.schema';

describe('Auth Validation Schemas', () => {
  it('should accept valid registration input', () => {
    const input = {
      email: 'landlord@rentease.com',
      password: 'SecurePassword123',
      fullName: 'John Doe',
      phone: '+1234567890',
      role: 'LANDLORD',
    };
    const result = RegisterInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const input = {
      email: 'test@rentease.com',
      password: 'weak',
      fullName: 'John Doe',
      role: 'TENANT',
    };
    const result = RegisterInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it('should accept valid login input', () => {
    const input = {
      email: 'tenant@rentease.com',
      password: 'AnyPassword123',
    };
    const result = LoginInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });
});

describe('Property & Unit Validation Schemas', () => {
  it('should accept valid property input', () => {
    const property = {
      title: 'BKK1 Premier Luxury Residences',
      description: 'Luxury high-rise apartments in downtown Phnom Penh.',
      addressLine1: '#45 Street 288, BKK1',
      city: 'Phnom Penh',
      state: 'Phnom Penh',
      postalCode: '120102',
      country: 'KH',
      amenities: ['Gym', 'Pool', 'Parking'],
    };
    const result = CreatePropertySchema.safeParse(property);
    expect(result.success).toBe(true);
  });

  it('should accept valid unit input', () => {
    const unit = {
      unitNumber: '4B',
      floor: 4,
      sizeSqFt: 850.5,
      bedrooms: 2,
      bathrooms: 2,
      rentAmount: 1850,
      depositAmount: 1850,
      status: 'AVAILABLE',
    };
    const result = CreateUnitSchema.safeParse(unit);
    expect(result.success).toBe(true);
  });
});

describe('Maintenance Validation Schemas', () => {
  it('should reject invalid UUID on maintenance request', () => {
    const ticket = {
      unitId: 'not-a-uuid',
      title: 'Leaking pipe under kitchen sink',
      description: 'Water is accumulating quickly under the sink cabinet.',
      priority: 'HIGH',
    };
    const result = CreateMaintenanceRequestSchema.safeParse(ticket);
    expect(result.success).toBe(false);
  });

  it('should accept valid maintenance request', () => {
    const ticket = {
      unitId: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Leaking pipe under kitchen sink',
      description: 'Water is accumulating quickly under the sink cabinet.',
      priority: 'HIGH',
    };
    const result = CreateMaintenanceRequestSchema.safeParse(ticket);
    expect(result.success).toBe(true);
  });
});
