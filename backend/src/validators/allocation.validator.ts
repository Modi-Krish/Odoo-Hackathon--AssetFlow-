import { z } from 'zod';

export const allocateAssetSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  employee_id: z.string().uuid('Invalid employee ID'),
  expected_return: z.string().optional().nullable(),
});

export const returnAssetSchema = z.object({
  allocation_id: z.string().uuid('Invalid allocation ID'),
});

export const transferAssetSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  from_employee: z.string().uuid('Invalid from employee ID'),
  to_employee: z.string().uuid('Invalid to employee ID'),
  notes: z.string().optional().nullable(),
});
