import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  issue: z.string().min(1, 'Issue description is required'),
  priority: z.enum(['low', 'medium', 'high', 'critical']).optional().default('medium'),
  attachments: z.array(z.string()).optional().nullable(),
});

export const approveMaintenanceSchema = z.object({
  technician_id: z.string().uuid('Invalid technician ID').optional().nullable(),
});
