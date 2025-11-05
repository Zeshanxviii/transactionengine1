// src/validators/subscriber.validators.js

import { z } from 'zod';

export const createSubscriberSchema = z.object({
  firstName: z.string()
    .min(1, 'First name required')
    .max(50, 'First name too long'),
  lastName: z.string()
    .min(1, 'Last name required')
    .max(50, 'Last name too long'),
  emailId: z.string()
    .email('Invalid email')
    .max(200, 'Email too long')
    .optional(),
  msisdn: z.string()
    .regex(/^[6-9]\d{9}$/, 'Invalid 10-digit mobile number'),
});

export const verifyOtpSchema = z.object({
  subscriberId: z.string()
    .min(1, 'Subscriber ID required'),
  otp: z.string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export const updateSubscriberSchema = z.object({
  status: z.enum(['Active', 'Inactive', 'Suspended']),
});

