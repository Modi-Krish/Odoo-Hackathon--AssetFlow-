import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required'),
  head_id: z.string().uuid().optional().nullable(),
  status: z.boolean().optional().default(true),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Department name is required').optional(),
  head_id: z.string().uuid().optional().nullable(),
  status: z.boolean().optional(),
});
