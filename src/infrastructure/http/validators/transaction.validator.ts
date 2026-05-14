import { z } from 'zod';

export const depositSchema = z.object({
  amount: z
    .number({ required_error: 'Amount is required.' })
    .int('Amount must be an integer (in cents).')
    .positive('Amount must be greater than 0.'),
  description: z.string().max(255).optional(),
});

export const transferSchema = z.object({
  receiverId: z
    .string({ required_error: 'receiverId is required.' })
    .uuid('receiverId must be a valid UUID.'),
  amount: z
    .number({ required_error: 'Amount is required.' })
    .int('Amount must be an integer (in cents).')
    .positive('Amount must be greater than 0.'),
  description: z.string().max(255).optional(),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
