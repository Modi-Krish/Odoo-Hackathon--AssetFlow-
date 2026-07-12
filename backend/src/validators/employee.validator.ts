import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'asset_manager', 'department_head', 'employee']).optional().default('employee'),
  department_id: z.string().uuid('Invalid department ID').optional().nullable(),
  status: z.boolean().optional().default(true),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'asset_manager', 'department_head', 'employee']).optional(),
  department_id: z.string().uuid().optional().nullable(),
  status: z.boolean().optional(),
});
