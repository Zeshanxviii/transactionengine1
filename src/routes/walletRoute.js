// routes/wallet.routes.js
import express from 'express';
import { authenticate } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery } from '../middlewares/validate.middleware.js';
import * as walletController from '../controllers/wallet/walletController.js';
import {
  createWalletSchema,
  getBalanceSchema,
  checkBalanceSchema,
  getWalletDetailsSchema,
} from '../validators/wallet.validators.js';

const router = express.Router();

// Create wallet
router.post(
  '/create',
  authenticate,
  validateBody(createWalletSchema),
  walletController.createWallet
);

// Get wallet balance
router.get(
  '/balance',
  authenticate,
  validateQuery(getBalanceSchema),
  walletController.fetchBalance
);

// Get wallet details
router.get(
  '/details',
  authenticate,
  validateQuery(getWalletDetailsSchema),
  walletController.getWalletBalance
);

// Check sufficient balance
router.post(
  '/check-balance',
  authenticate,
  validateBody(checkBalanceSchema),
  walletController.checkSufficentBalance
);

export default router;
