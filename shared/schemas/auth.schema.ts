import { z } from 'zod';

export const UserRoleSchema = z.enum(['ADMIN', 'LANDLORD', 'TENANT', 'TECHNICIAN']);
export const UserStatusSchema = z.enum(['ACTIVE', 'SUSPENDED', 'PENDING_VERIFICATION']);

export const RegisterInputSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(100).trim(),
  phone: z.string().optional().nullable(),
  role: z.enum(['LANDLORD', 'TENANT']).default('TENANT'),
  termsAccepted: z.boolean().optional(),
  termsVersion: z.string().optional(),
});

export type RegisterInput = z.infer<typeof RegisterInputSchema>;

export const LoginInputSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof LoginInputSchema>;

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Please enter a valid email address').toLowerCase().trim(),
});

export type PasswordResetRequestInput = z.infer<typeof PasswordResetRequestSchema>;

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .max(128, 'Password must not exceed 128 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[a-z]/, 'Password must include at least one lowercase letter')
    .regex(/[0-9]/, 'Password must include at least one number'),
});

export type PasswordResetConfirmInput = z.infer<typeof PasswordResetConfirmSchema>;
