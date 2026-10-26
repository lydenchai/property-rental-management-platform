import { z } from 'zod';
import { UnitStatus } from '../types/enums/unit-status.enum';

export const UnitStatusSchema = z.nativeEnum(UnitStatus);

export const CreatePropertySchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  addressLine1: z.string().min(3, 'Address line 1 is required').max(255),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State / Province is required').max(100),
  postalCode: z.string().min(2, 'Postal code is required').max(20),
  country: z.string().min(2, 'Country is required').max(100).default('KH'),
  amenities: z.array(z.string()).default([]),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
});

export type CreatePropertyInput = z.infer<typeof CreatePropertySchema>;

export const UpdatePropertySchema = CreatePropertySchema.partial();
export type UpdatePropertyInput = z.infer<typeof UpdatePropertySchema>;

export const CreateUnitSchema = z.object({
  unitNumber: z.string().min(1, 'Unit number is required').max(50),
  floor: z.number().int().min(0, 'Floor must be 0 or higher').default(1),
  sizeSqFt: z.number().positive('Size must be positive'),
  bedrooms: z.number().int().min(0, 'Bedrooms cannot be negative'),
  bathrooms: z.number().min(0.5, 'Bathrooms must be at least 0.5'),
  rentAmount: z.number().positive('Monthly rent must be positive'),
  depositAmount: z.number().nonnegative('Deposit cannot be negative'),
  status: UnitStatusSchema.default('AVAILABLE'),
  images: z.array(z.string()).default([]),
});

export type CreateUnitInput = z.infer<typeof CreateUnitSchema>;

export const UpdateUnitSchema = CreateUnitSchema.partial();
export type UpdateUnitInput = z.infer<typeof UpdateUnitSchema>;
