// routes/transaction.routes.js
import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware.js';
import * as transactionController from '../controllers/transaction/transactionController.js'
import {
    transferSchema,
    getTransactionSchema,
    getTransactionHistorySchema,
    rechargeSchema,
    billPaymentSchema,
    getTransactionStatusSchema,
  } from '../validators/transaction.validators.js';

const router = express.Router();

// ============================================================
// MONEY TRANSFER ENDPOINTS
// ============================================================

/**
 * Process P2P money transfer
 * POST /api/transactions/transfer
 * Body: { payeeUserId, amount, serviceType?, productType?, remarks? }
 */
router.post(
  '/transfer',
  authenticate,
  validateBody(transferSchema),
  transactionController.MoneyTransferRequest
);

// ============================================================
// GET TRANSACTION DETAILS
// ============================================================

/**
 * Get transaction by ID
 * GET /api/transactions/:transferId
 * Params: { transferId }
 */
router.get(
  '/:transferId',
  authenticate,
  validateParams(getTransactionSchema),
  transactionController.fetchTransactionDetail
);

// ============================================================
// TRANSACTION HISTORY
// ============================================================

/**
 * Get current user's transaction history
 * GET /api/transactions/history/me
 * Query: { limit?, page?, status?, startDate?, endDate? }
 */
router.get(
  '/history/me',
  authenticate,
  validateQuery(getTransactionHistorySchema),
  transactionController.fetchTransactionHistry
);

/**
 * Get all transactions (Admin only)
 * GET /api/transactions/history/all
 * Query: { limit?, page?, status?, userId? }
 */
router.get(
  '/history/all',
  authenticate,
  authorize('ADMIN'),
  validateQuery(getTransactionHistorySchema),
 transactionController.fetchAllTransaction
);

// ============================================================
// TRANSACTION STATUS
// ============================================================

/**
 * Check transaction status
 * GET /api/transactions/status/:transferId
 * Params: { transferId }
 */
router.get(
  '/status/:transferId',
  authenticate,
  validateParams(getTransactionStatusSchema),
 transactionController.fetchTransactionStatus
);

// ============================================================
// RECHARGE ENDPOINTS
// ============================================================

/**
 * Mobile/DTH Recharge
 * POST /api/transactions/recharge
 * Body: { productId, serviceProvider, mobileNumber, amount, productType, operator?, circle? }
 */
router.post(
  '/recharge',
  authenticate,
  validateBody(rechargeSchema),
 transactionController.RechargeRequest
);

// ============================================================
// BILL PAYMENT ENDPOINTS
// ============================================================

/**
 * Bill Payment (Electricity, Water, Gas, etc.)
 * POST /api/transactions/bill-payment
 * Body: { serviceProvider, consumerNumber, amount, productType, billDetails?, remarks? }
 */
router.post(
  '/bill-payment',
  authenticate,
  validateBody(billPaymentSchema),
 transactionController.BillRequest
);

// ============================================================
// TRANSACTION STATISTICS (Optional)
// ============================================================

/**
 * Get transaction statistics for current user
 * GET /api/transactions/stats/me
 */
router.get(
  '/stats/me',
  authenticate,
 transactionController.fetchTransactionStatistics
);

export default router;