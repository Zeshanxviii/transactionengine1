// services/transactionService.js
import { db } from '../database/db.js';
import { itnTransactionHeader, itnTransactionItems } from '../database/schema/schema.js';
import { eq } from 'drizzle-orm';
import { generateId } from '../utils/idGenerator.js';
import { WalletService } from './walletService.js'

export class TransactionService {
  // Process a money transfer transaction
  async processTransfer(transferData) {
    const {
      payerUserId,
      payeeUserId,
      amount, // in rupees
      serviceType = 'TRANSFER',
      productType = 'P2P',
      remarks = '',
      createdBy,
    } = transferData;

    const transferId = generateId('TXN');
    const amountInPaise = Math.round(amount * 100); // Convert to paise

    try {
      // 1. Get payer and payee wallets
      const payerWallet = await WalletService.getWalletByUserId(payerUserId);
      const payeeWallet = await WalletService.getWalletByUserId(payeeUserId);

      if (!payerWallet) {
        throw new Error('Payer wallet not found');
      }
      if (!payeeWallet) {
        throw new Error('Payee wallet not found');
      }

      // 2. Check sufficient balance
      const hasSufficient = await WalletService.hasSufficientBalance(
        payerUserId,
        amountInPaise
      );

      if (!hasSufficient) {
        // Create failed transaction record
        await this.createTransactionHeader({
          transferId,
          payerUserId,
          payerAccountId: payerWallet.wallet_id,
          payeeUserId,
          payeeAccountId: payeeWallet.wallet_id,
          requestedValue: amountInPaise,
          transferStatus: 'FAILED',
          errorCode: 'INSUFFICIENT_BALANCE',
          serviceType,
          productType,
          remarks,
          createdBy,
        });

        throw new Error('Insufficient balance');
      }

      // 3. Debit from payer wallet
      await WalletService.updateWalletBalance(
        payerWallet.wallet_id,
        amountInPaise,
        'DEBIT',
        transferId
      );

      // 4. Credit to payee wallet
      await WalletService.updateWalletBalance(
        payeeWallet.wallet_id,
        amountInPaise,
        'CREDIT',
        transferId
      );

      // 5. Create transaction header
      await this.createTransactionHeader({
        transferId,
        payerUserId,
        payerAccountId: payerWallet.wallet_id,
        payeeUserId,
        payeeAccountId: payeeWallet.wallet_id,
        requestedValue: amountInPaise,
        transferStatus: 'SUCCESS',
        errorCode: null,
        serviceType,
        productType,
        remarks,
        createdBy,
      });

      // 6. Create transaction items (payer debit)
      await this.createTransactionItem({
        transferId,
        partyId: payerUserId,
        secondParty: payeeUserId,
        userType: payerWallet.user_type,
        transactionType: 'DEBIT',
        approvedValue: amountInPaise,
        serviceType,
        productType,
        previousBalance: Number(payerWallet.balance),
        postBalance: Number(payerWallet.balance) - amountInPaise,
      });

      // 7. Create transaction items (payee credit)
      await this.createTransactionItem({
        transferId,
        partyId: payeeUserId,
        secondParty: payerUserId,
        userType: payeeWallet.user_type,
        transactionType: 'CREDIT',
        approvedValue: amountInPaise,
        serviceType,
        productType,
        previousBalance: Number(payeeWallet.balance),
        postBalance: Number(payeeWallet.balance) + amountInPaise,
      });

      return {
        success: true,
        transferId,
        message: 'Transfer successful',
        amount: amount,
        payerBalance: (Number(payerWallet.balance) - amountInPaise) / 100,
        payeeBalance: (Number(payeeWallet.balance) + amountInPaise) / 100,
      };
    } catch (error) {
      // Rollback would happen here if using transactions
      throw error;
    }
  }

  // Create transaction header
  async createTransactionHeader(data) {
    await db.insert(itnTransactionHeader).values({
      transferId: data.transferId,
      transferOn: new Date(),
      payerUserId: data.payerUserId,
      payerAccountId: data.payerAccountId,
      payeeUserId: data.payeeUserId,
      payeeAccountId: data.payeeAccountId,
      requestedValue: data.requestedValue,
      errorCode: data.errorCode,
      transferStatus: data.transferStatus,
      serviceType: data.serviceType,
      productType: data.productType,
      remarks: data.remarks,
      createdBy: data.createdBy,
      createdOn: new Date().toISOString(),
    });
  }

  // Create transaction item
  async createTransactionItem(data) {
    await db.insert(itnTransactionItems).values({
      transferId: data.transferId,
      transferOn: new Date(),
      transferStatus: 'SUCCESS',
      partyId: data.partyId,
      secondParty: data.secondParty,
      userType: data.userType,
      transactionType: data.transactionType,
      approvedValue: data.approvedValue,
      serviceType: data.serviceType,
      productType: data.productType,
      previousBalance: data.previousBalance,
      postBalance: data.postBalance,
    });
  }

  // Get transaction by ID
  async getTransaction(transferId) {
    const transaction = await db.select()
      .from(itnTransactionHeader)
      .where(eq(itnTransactionHeader.transferId, transferId))
      .limit(1);

    if (!transaction.length) {
      throw new Error('Transaction not found');
    }

    return transaction[0];
  }

  // Get user transactions
  async getUserTransactions(userId, limit = 50) {
    const transactions = await db.select()
      .from(itnTransactionHeader)
      .where(
        eq(itnTransactionHeader.payerUserId, userId)
      )
      .limit(limit)
      .orderBy('transfer_on DESC');

    return transactions.map(txn => ({
      transferId: txn.transferId,
      transferOn: txn.transferOn,
      amount: Number(txn.requestedValue) / 100,
      status: txn.transferStatus,
      serviceType: txn.serviceType,
      payeeUserId: txn.payeeUserId,
      remarks: txn.remarks,
    }));
  }
}
