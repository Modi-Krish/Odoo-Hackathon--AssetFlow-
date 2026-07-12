import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  category_id: z.string().uuid('Invalid category ID'),
  serial_number: z.string().optional().nullable(),
  condition: z.enum(['new', 'good', 'fair', 'poor']).optional().default('new'),
  purchase_date: z.string().optional().nullable(),
  purchase_cost: z.number().positive().optional().nullable(),
  location: z.string().optional().nullable(),
  bookable: z.boolean().optional().default(false),
  image_url: z.string().url().optional().nullable(),
});

export const updateAssetSchema = z.object({
  name: z.string().min(1).optional(),
  category_id: z.string().uuid().optional(),
  serial_number: z.string().optional().nullable(),
  condition: z.enum(['new', 'good', 'fair', 'poor']).optional(),
  status: z.enum(['available', 'allocated', 'reserved', 'under_maintenance', 'lost', 'retired', 'disposed']).optional(),
  purchase_date: z.string().optional().nullable(),
  purchase_cost: z.number().positive().optional().nullable(),
  location: z.string().optional().nullable(),
  bookable: z.boolean().optional(),
  image_url: z.string().url().optional().nullable(),
});
