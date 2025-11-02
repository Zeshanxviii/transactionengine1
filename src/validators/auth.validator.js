import { z } from 'zod';

export const loginSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  password: z.string().min(1, 'Password required'),
});

export const createUserSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  userName: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  firstName: z.string().min(1, 'First name required'),
  lastName: z.string().min(1, 'Last name required'),
  msisdn: z.string().regex(/^\d{10}$/, 'Valid 10-digit phone number required'),
  emailId: z.string().email('Valid email required'),
  userType: z.enum(['USER', 'MERCHANT', 'DISTRIBUTOR', 'ADMIN']),
  categoryCode: z.string().optional(),
  status: z.string().default('ACTIVE'),
});
