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


// MONEY TRANSFER ENDPOINTS

router.post(
  '/transfer',
  authenticate,
  validateBody(transferSchema),
  transactionController.MoneyTransferRequest
);

// GET TRANSACTION DETAILS

router.get(
  '/:transferId',
  authenticate,
  validateParams(getTransactionSchema),
  transactionController.fetchTransactionDetail
);

// TRANSACTION HISTORY

router.get(
  '/history/me',
  authenticate,
  validateQuery(getTransactionHistorySchema),
  transactionController.fetchTransactionHistry
);

router.get(
  '/history/all',
  authenticate,
  authorize('ADMIN'),
  validateQuery(getTransactionHistorySchema),
 transactionController.fetchAllTransaction
);

// TRANSACTION STATUS

router.get(
  '/status/:transferId',
  authenticate,
  validateParams(getTransactionStatusSchema),
 transactionController.fetchTransactionStatus
);

// RECHARGE ENDPOINTS

router.post(
  '/recharge',
  authenticate,
  // validateBody(rechargeSchema),
 transactionController.RechargeRequest
);

// BILL PAYMENT ENDPOINTS

router.post(
  '/bill-payment',
  authenticate,
  validateBody(billPaymentSchema),
 transactionController.BillRequest
);

// TRANSACTION STATISTICS (Optional)

router.get(
  '/stats/me',
  authenticate,
 transactionController.fetchTransactionStatistics
);

export default router;