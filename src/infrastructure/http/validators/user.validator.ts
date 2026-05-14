import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string({ required_error: 'Name is required.' })
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name must be at most 100 characters.')
    .trim(),
  email: z
    .string({ required_error: 'Email is required.' })
    .email('Invalid email format.')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters.')
    .optional(),
  initialBalance: z
    .number()
    .int('Initial balance must be an integer (in cents).')
    .nonnegative('Initial balance must be zero or greater.')
    .max(100000, 'Initial balance must be at most 100000.')
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format.').toLowerCase().trim(),
  password: z.string().min(1, 'Password is required.'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).trim().optional(),
  bio: z.string().max(255).nullable().optional(),
  avatarUrl: z.string().url('Invalid URL format.').nullable().optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
