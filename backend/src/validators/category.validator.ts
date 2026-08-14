import { z } from 'zod';

export const categorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable().or(z.literal('')),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

