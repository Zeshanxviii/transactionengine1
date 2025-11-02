// validators/wallet.validators.js
import { z } from 'zod';

// Wallet type enum
const WalletTypeEnum = z.enum(['MAIN', 'COMMISSION', 'CASHBACK', 'BONUS'], {
  errorMap: () => ({ message: 'Wallet type must be one of: MAIN, COMMISSION, CASHBACK, BONUS' }),
});

// Create wallet validation
const createWalletSchema = z.object({
  userId: z.string()
    .trim()
    .min(3, 'User ID must be at least 3 characters')
    .max(20, 'User ID must not exceed 20 characters'),
  walletType: WalletTypeEnum.default('MAIN').optional(),
});

// Get balance validation (query params)
const getBalanceSchema = z.object({
  walletType: WalletTypeEnum.default('MAIN').optional(),
});

// Check balance validation
const checkBalanceSchema = z.object({
  amount: z.number()
    .positive('Amount must be greater than zero')
    .min(0.01, 'Minimum amount is ₹0.01')
    .max(1000000, 'Maximum amount is ₹10,00,000'),
  walletType: WalletTypeEnum.default('MAIN').optional(),
});

// Credit/Debit wallet validation (Admin operations)
const walletOperationSchema = z.object({
  userId: z.string()
    .trim()
    .min(3, 'User ID must be at least 3 characters')
    .max(20, 'User ID must not exceed 20 characters'),
  amount: z.number()
    .positive('Amount must be greater than zero')
    .min(1, 'Minimum amount is ₹1')
    .max(100000, 'Maximum amount is ₹1,00,000'),
  walletType: WalletTypeEnum.default('MAIN').optional(),
  remarks: z.string()
    .trim()
    .min(5, 'Remarks must be at least 5 characters')
    .max(200, 'Remarks must not exceed 200 characters')
    .optional(),
  operationType: z.enum(['CREDIT', 'DEBIT'], {
    errorMap: () => ({ message: 'Operation type must be either CREDIT or DEBIT' }),
  }),
});

// Get wallet details validation (query params)
const getWalletDetailsSchema = z.object({
  walletType: WalletTypeEnum.default('MAIN').optional(),
});

export {
  createWalletSchema,
  getBalanceSchema,
  checkBalanceSchema,
  walletOperationSchema,
  getWalletDetailsSchema,
  WalletTypeEnum,
};