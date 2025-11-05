// src/validators/threshold.validators.js

import { z } from 'zod';

export const createThresholdProfileSchema = z.object({
  thresProfileId: z.string()
    .min(3, 'Threshold profile ID required')
    .max(20, 'Profile ID too long'),
  name: z.string()
    .min(1, 'Profile name required')
    .max(20, 'Name too long'),
  userType: z.enum(['USER', 'MERCHANT', 'DISTRIBUTOR', 'ADMIN']),
  status: z.enum(['Y', 'N']).default('Y').optional(),
});

export const createThresholdDetailsSchema = z.object({
  thresProfileId: z.string()
    .min(3, 'Threshold profile ID required'),
  groupId: z.string()
    .min(1, 'Group ID required')
    .max(20, 'Group ID too long')
    .default('DEFAULT'),
  payerCount: z.number()
    .int('Must be integer')
    .positive('Payer count must be positive'),
  payerAmt: z.number()
    .int('Must be in paise')
    .positive('Payer amount must be positive'),
  payeeCount: z.number()
    .int('Must be integer')
    .positive('Payee count must be positive'),
  payeeAmt: z.number()
    .int('Must be in paise')
    .positive('Payee amount must be positive'),
});

export const validateThresholdSchema = z.object({
  userId: z.string().min(1, 'User ID required'),
  amount: z.number().positive('Amount must be positive'),
  role: z.enum(['PAYER', 'PAYEE']).default('PAYER'),
  groupId: z.string().default('DEFAULT').optional(),
});

export const getUserLimitsSchema = z.object({
  role: z.enum(['PAYER', 'PAYEE']).default('PAYER').optional(),
  groupId: z.string().default('DEFAULT').optional(),
});

