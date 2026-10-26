import { z } from 'zod';

export const MaintenancePrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'EMERGENCY']);

export const MaintenanceStatusSchema = z.enum([
  'OPEN',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'CONFIRMED_CLOSED',
  'CANCELLED',
]);

export const CreateMaintenanceRequestSchema = z.object({
  unitId: z.union([
    z.string().uuid('Invalid unit ID'),
    z.string().regex(/^unit-[a-z0-9-]+$/i, 'Invalid unit ID format'),
  ]),
  title: z.string().min(5, 'Title must be at least 5 characters').max(150),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  priority: MaintenancePrioritySchema.default('MEDIUM'),
});

export type CreateMaintenanceRequestInput = z.infer<typeof CreateMaintenanceRequestSchema>;

export const AssignTechnicianSchema = z.object({
  technicianId: z.union([
    z.string().uuid('Invalid technician ID'),
    z.string().regex(/^[a-z0-9-]+$/i, 'Invalid technician ID format'),
  ]),
  notes: z.string().max(500).optional().nullable(),
});

export type AssignTechnicianInput = z.infer<typeof AssignTechnicianSchema>;

export const UpdateProgressSchema = z.object({
  status: z.enum(['IN_PROGRESS', 'RESOLVED']),
  resolutionNotes: z
    .string()
    .min(5, 'Please provide progress or resolution details')
    .max(2000)
    .optional(),
});

export type UpdateProgressInput = z.infer<typeof UpdateProgressSchema>;

export const ResolveMaintenanceSchema = z.object({
  resolutionNotes: z.string().min(5, 'Please provide resolution notes').max(2000),
});

export type ResolveMaintenanceInput = z.infer<typeof ResolveMaintenanceSchema>;

export const ConfirmMaintenanceSchema = z.object({
  confirmed: z.boolean().default(true),
  feedback: z.string().max(500).optional().nullable(),
});

export type ConfirmMaintenanceInput = z.infer<typeof ConfirmMaintenanceSchema>;

export const QueryMaintenanceSchema = z.object({
  unitId: z.string().optional(),
  status: MaintenanceStatusSchema.optional(),
  priority: MaintenancePrioritySchema.optional(),
});

export type QueryMaintenanceInput = z.infer<typeof QueryMaintenanceSchema>;
