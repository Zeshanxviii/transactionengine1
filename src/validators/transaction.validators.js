// validators/transaction.validators.js
import { z } from 'zod';

// Service type enum
const ServiceTypeEnum = z.enum([
  'TRANSFER',
  'RECHARGE',
  'BILL_PAYMENT',
  'DMT',
  'AEPS',
  'PAN_CARD',
  'INSURANCE',
], {
  errorMap: () => ({ message: 'Invalid service type' }),
});

// Product type enum
const ProductTypeEnum = z.enum([
  'P2P',
  'MOBILE',
  'DTH',
  'ELECTRICITY',
  'GAS',
  'WATER',
  'BROADBAND',
  'INSURANCE',
  'LOAN_REPAYMENT',
], {
  errorMap: () => ({ message: 'Invalid product type' }),
});

// Transfer validation
const transferSchema = z.object({
  payeeUserId: z.string()
    .trim()
    .min(3, 'Payee user ID must be at least 3 characters')
    .max(20, 'Payee user ID must not exceed 20 characters'),
  amount: z.number()
    .positive('Amount must be greater than zero')
    .min(1, 'Minimum transfer amount is ₹1')
    .max(50000, 'Maximum transfer amount is ₹50,000'),
  serviceType: ServiceTypeEnum.default('TRANSFER').optional(),
  productType: ProductTypeEnum.default('P2P').optional(),
  remarks: z.string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .optional(),
});

// Get transaction by ID validation (params)
const getTransactionSchema = z.object({
  transferId: z.string()
    .trim()
    .min(5, 'Invalid transaction ID')
    .max(50, 'Invalid transaction ID'),
});

// Get transaction history validation (query params)
const getTransactionHistorySchema = z.object({
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 50)
    .pipe(
      z.number()
        .int('Limit must be an integer')
        .min(1, 'Minimum limit is 1')
        .max(100, 'Maximum limit is 100')
    ),
  page: z.string()
    .optional()
    .transform((val) => val ? parseInt(val) : 1)
    .pipe(
      z.number()
        .int('Page must be an integer')
        .min(1, 'Minimum page is 1')
    ),
  status: z.enum(['SUCCESS', 'FAILED', 'PENDING', 'ALL'])
    .optional()
    .default('ALL'),
  startDate: z.string()
    .datetime('Invalid start date format')
    .optional(),
  endDate: z.string()
    .datetime('Invalid end date format')
    .optional(),
});

// Recharge validation
const rechargeSchema = z.object({
  productId: z.string()
    .trim()
    .min(3, 'Product ID is required')
    .max(20, 'Invalid product ID'),
  serviceProvider: z.string()
    .trim()
    .min(2, 'Service provider is required')
    .max(75, 'Service provider name too long'),
  mobileNumber: z.string()
    .trim()
    .regex(/^[6-9]\d{9}$/, 'Invalid mobile number')
    .length(10, 'Mobile number must be 10 digits'),
  amount: z.number()
    .positive('Amount must be greater than zero')
    .min(10, 'Minimum recharge amount is ₹10')
    .max(10000, 'Maximum recharge amount is ₹10,000'),
  productType: ProductTypeEnum,
  operator: z.string()
    .trim()
    .min(2, 'Operator name is required')
    .optional(),
  circle: z.string()
    .trim()
    .optional(),
});

// Bill payment validation
const billPaymentSchema = z.object({
  serviceProvider: z.string()
    .trim()
    .min(2, 'Service provider is required')
    .max(75, 'Service provider name too long'),
  consumerNumber: z.string()
    .trim()
    .min(5, 'Consumer number is required')
    .max(50, 'Consumer number too long'),
  amount: z.number()
    .positive('Amount must be greater than zero')
    .min(1, 'Minimum bill payment amount is ₹1')
    .max(100000, 'Maximum bill payment amount is ₹1,00,000'),
  productType: ProductTypeEnum,
  billDetails: z.object({
    billNumber: z.string().optional(),
    dueDate: z.string().optional(),
    billAmount: z.number().optional(),
  }).optional(),
  remarks: z.string()
    .trim()
    .max(500, 'Remarks must not exceed 500 characters')
    .optional(),
});

// Transaction status check validation (params)
const getTransactionStatusSchema = z.object({
  transferId: z.string()
    .trim()
    .min(5, 'Invalid transaction ID')
    .max(50, 'Invalid transaction ID'),
});

export {
  transferSchema,
  getTransactionSchema,
  getTransactionHistorySchema,
  rechargeSchema,
  billPaymentSchema,
  getTransactionStatusSchema,
  ServiceTypeEnum,
  ProductTypeEnum,
};