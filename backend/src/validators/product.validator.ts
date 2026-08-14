import { z } from 'zod';

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional().nullable(),
  price: z.number().positive('Price must be a positive number'),
  image: z.string().optional().nullable().or(z.literal('')),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  preparationTime: z.number().int().min(1).default(15),
  isVeg: z.boolean().default(true),
});

