// validators/product.validators.js
import { z } from 'zod';

// ============================================================
// ENUMS
// ============================================================

export const ProductTypeEnum = z.enum([
  'MOBILE',
  'DTH',
  'ELECTRICITY',
  'GAS',
  'WATER',
  'BROADBAND',
  'LANDLINE',
  'CABLE_TV',
  'INSURANCE',
  'LOAN_REPAYMENT',
  'CREDIT_CARD',
  'FASTAG',
  'LPG',
], {
  errorMap: () => ({ message: 'Invalid product type' }),
});

export const ProductStatusEnum = z.enum(['ACTIVE', 'INACTIVE', 'PENDING'], {
  errorMap: () => ({ message: 'Invalid product status' }),
});

export const RechargeTypeEnum = z.enum([
  'PREPAID',
  'POSTPAID',
  'BOTH',
  'NA',
], {
  errorMap: () => ({ message: 'Invalid recharge type' }),
});

export const MarginTypeEnum = z.enum(['FLAT', 'PERCENTAGE'], {
  errorMap: () => ({ message: 'Invalid margin type' }),
});

export const CommissionTypeEnum = z.enum(['FLAT', 'PERCENTAGE'], {
  errorMap: () => ({ message: 'Invalid commission type' }),
});

export const CommissionDirectionEnum = z.enum(['CREDIT', 'DEBIT'], {
  errorMap: () => ({ message: 'Invalid commission direction' }),
});

export const UserTypeEnum = z.enum([
  'ADMIN',
  'USER',
  'RETAILER',
  'DISTRIBUTOR',
  'MERCHANT',
  'SUPER_DISTRIBUTOR',
  'API_USER',
], {
  errorMap: () => ({ message: 'Invalid user type' }),
});

// ============================================================
// PRODUCT VALIDATORS
// ============================================================

// Register system product
export const registerProductSchema = z.object({
  productType: ProductTypeEnum,
  
  serviceProvider: z.string()
    .trim()
    .min(2, 'Service provider must be at least 2 characters')
    .max(75, 'Service provider name too long'),
  
  rechargeType: RechargeTypeEnum,
  
  productCode: z.string()
    .trim()
    .min(2, 'Product code must be at least 2 characters')
    .max(50, 'Product code too long')
    .regex(/^[A-Z0-9_-]+$/, 'Product code can only contain uppercase letters, numbers, underscore and hyphen'),
  
  api: z.string()
    .trim()
    .min(2, 'API name is required')
    .max(20, 'API name too long'),
  
  imageUrl: z.string()
    .url('Invalid image URL')
    .optional(),
  
  status: ProductStatusEnum.optional().default('ACTIVE'),
});

// Update product
export const updateProductSchema = z.object({
  productType: ProductTypeEnum.optional(),
  serviceProvider: z.string().trim().min(2).max(75).optional(),
  rechargeType: RechargeTypeEnum.optional(),
  productCode: z.string().trim().min(2).max(50).optional(),
  api: z.string().trim().min(2).max(20).optional(),
  imageUrl: z.string().url().optional(),
  status: ProductStatusEnum.optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Get products query
export const getProductsQuerySchema = z.object({
  productType: ProductTypeEnum.optional(),
  serviceProvider: z.string().trim().optional(),
  status: ProductStatusEnum.optional(),
  search: z.string().trim().max(100).optional(),
  limit: z.string()
    .optional()
    .default('100')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(500)),
});

// Product ID param
export const productIdSchema = z.object({
  productId: z.string()
    .trim()
    .min(3, 'Invalid product ID')
    .max(20, 'Invalid product ID'),
});

// ============================================================
// PRODUCT PROFILE VALIDATORS
// ============================================================

// Create product profile
export const createProductProfileSchema = z.object({
  productId: z.string()
    .trim()
    .min(3, 'Product ID is required')
    .max(20, 'Invalid product ID'),
  
  productType: ProductTypeEnum,
  
  serviceProvider: z.string()
    .trim()
    .min(2, 'Service provider is required')
    .max(75, 'Service provider name too long'),
  
  rechargeType: RechargeTypeEnum,
  
  productCode: z.string()
    .trim()
    .min(2, 'Product code is required')
    .max(50, 'Product code too long'),
  
  api: z.string()
    .trim()
    .min(2, 'API name is required')
    .max(20, 'API name too long'),
  
  marginType: MarginTypeEnum.optional(),
  
  margin: z.number()
    .int('Margin must be an integer')
    .min(0, 'Margin cannot be negative')
    .max(100000, 'Margin too high')
    .optional()
    .default(0),
  
  status: z.enum(['A', 'I']).optional().default('A'),
});

// Update product profile
export const updateProductProfileSchema = z.object({
  productType: ProductTypeEnum.optional(),
  rechargeType: RechargeTypeEnum.optional(),
  productCode: z.string().trim().min(2).max(50).optional(),
  api: z.string().trim().min(2).max(20).optional(),
  marginType: MarginTypeEnum.optional(),
  margin: z.number().int().min(0).max(100000).optional(),
  status: z.enum(['A', 'I']).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Get product profile params
export const getProductProfileParamsSchema = z.object({
  productId: z.string().trim().min(3).max(20),
  serviceProvider: z.string().trim().min(2).max(75),
});

// ============================================================
// COMMISSION VALIDATORS
// ============================================================

// Create commission
export const createCommissionSchema = z.object({
  productId: z.string()
    .trim()
    .min(3, 'Product ID is required')
    .max(20, 'Invalid product ID'),
  
  productType: ProductTypeEnum,
  
  serviceProvider: z.string()
    .trim()
    .min(2, 'Service provider is required')
    .max(75, 'Service provider name too long'),
  
  rechargeType: RechargeTypeEnum,
  
  userType: UserTypeEnum,
  
  userCategory: z.string()
    .trim()
    .min(1, 'User category is required')
    .max(5, 'User category too long')
    .regex(/^[A-Z0-9]+$/, 'User category must be uppercase alphanumeric'),
  
  commissionType: CommissionTypeEnum,
  
  commissionDirection: CommissionDirectionEnum,
  
  commission: z.number()
    .int('Commission must be an integer')
    .min(0, 'Commission cannot be negative')
    .max(100000, 'Commission value too high'),
  
  status: z.enum(['ACTIVE', 'INACTIVE']).optional().default('ACTIVE'),
}).refine(
  (data) => {
    // If commission type is PERCENTAGE, value should be <= 100
    if (data.commissionType === 'PERCENTAGE' && data.commission > 100) {
      return false;
    }
    return true;
  },
  {
    message: 'Percentage commission cannot exceed 100',
    path: ['commission'],
  }
);

// Update commission
export const updateCommissionSchema = z.object({
  commissionType: CommissionTypeEnum.optional(),
  commissionDirection: CommissionDirectionEnum.optional(),
  commission: z.number().int().min(0).max(100000).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
}).refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
);

// Get commission params
export const getCommissionParamsSchema = z.object({
  productId: z.string().trim().min(3).max(20),
  productType: ProductTypeEnum,
  serviceProvider: z.string().trim().min(2).max(75),
  userType: UserTypeEnum,
  userCategory: z.string().trim().min(1).max(5),
});

// Get commissions query
export const getCommissionsQuerySchema = z.object({
  productId: z.string().trim().optional(),
  productType: ProductTypeEnum.optional(),
  serviceProvider: z.string().trim().optional(),
  userType: UserTypeEnum.optional(),
  userCategory: z.string().trim().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  limit: z.string()
    .optional()
    .default('100')
    .transform(val => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(500)),
});

// Bulk create commissions
export const bulkCreateCommissionsSchema = z.object({
  productId: z.string().trim().min(3).max(20),
  productType: ProductTypeEnum,
  serviceProvider: z.string().trim().min(2).max(75),
  commissions: z.array(
    z.object({
      userType: UserTypeEnum,
      userCategory: z.string().trim().min(1).max(5),
      rechargeType: RechargeTypeEnum,
      commissionType: CommissionTypeEnum,
      commissionDirection: CommissionDirectionEnum,
      commission: z.number().int().min(0).max(100000),
      status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    })
  ).min(1, 'At least one commission configuration is required')
    .max(20, 'Maximum 20 commissions can be created at once'),
});

// ============================================================
// SERVICE TYPE VALIDATORS
// ============================================================

export const registerServiceTypeSchema = z.object({
  serviceType: z.string()
    .trim()
    .min(2, 'Service type must be at least 2 characters')
    .max(20, 'Service type too long')
    .regex(/^[A-Z_]+$/, 'Service type must be uppercase letters and underscores only'),
  
  serviceName: z.string()
    .trim()
    .min(3, 'Service name must be at least 3 characters')
    .max(100, 'Service name too long'),
  
  status: z.enum(['A', 'I']).optional().default('A'),
  
  isFinancial: z.enum(['Y', 'N']).optional().default('N'),
});

// ============================================================
// CALCULATE COMMISSION VALIDATOR
// ============================================================

export const calculateCommissionSchema = z.object({
  productId: z.string().trim().min(3).max(20),
  productType: ProductTypeEnum,
  serviceProvider: z.string().trim().min(2).max(75),
  userType: UserTypeEnum,
  userCategory: z.string().trim().min(1).max(5),
  transactionAmount: z.number()
    .int('Transaction amount must be in paise (integer)')
    .positive('Transaction amount must be positive')
    .min(100, 'Minimum transaction amount is ₹1')
    .max(10000000, 'Maximum transaction amount is ₹1,00,000'),
});

export default {
  registerProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdSchema,
  createProductProfileSchema,
  updateProductProfileSchema,
  getProductProfileParamsSchema,
  createCommissionSchema,
  updateCommissionSchema,
  getCommissionParamsSchema,
  getCommissionsQuerySchema,
  bulkCreateCommissionsSchema,
  registerServiceTypeSchema,
  calculateCommissionSchema,
  ProductTypeEnum,
  ProductStatusEnum,
  RechargeTypeEnum,
  MarginTypeEnum,
  CommissionTypeEnum,
  CommissionDirectionEnum,
  UserTypeEnum,
};