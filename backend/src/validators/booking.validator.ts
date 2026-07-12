import { z } from 'zod';

export const createBookingSchema = z.object({
  asset_id: z.string().uuid('Invalid asset ID'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  purpose: z.string().optional().nullable(),
});

export const updateBookingSchema = z.object({
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  purpose: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).optional(),
});
