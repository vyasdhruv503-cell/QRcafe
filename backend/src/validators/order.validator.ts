import { z } from 'zod';

export const createOrderSchema = z.object({
  tableToken: z.string().min(1, 'Table token is required'),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'PAY_AT_COUNTER', 'ONLINE']).default('PAY_AT_COUNTER'),
  items: z
    .array(
      z.object({
        productId: z.string().min(1, 'Product ID is required'),
        quantity: z.number().int().min(1, 'Quantity must be at least 1'),
        specialNote: z.string().optional(),
      })
    )
    .min(1, 'Cart must contain at least one item'),
});

export const updateOrderStatusSchema = z.object({
  orderStatus: z.enum(['PENDING', 'ACCEPTED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED']),
  paymentStatus: z.enum(['PENDING', 'PAID', 'FAILED', 'REFUNDED']).optional(),
});
