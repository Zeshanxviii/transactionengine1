// src/services/transactionService.js

import { db } from '../database/db.js';
import { itnTransactionHeader, itnTransactionItems } from '../database/schema/schema.js';
import { eq } from 'drizzle-orm';
import { generateId } from '../utils/idGenerator.js';
import { WalletService } from './walletService.js';
import { thresholdService } from './thresholdService.js';

export class TransactionService {
  async processTransfer(transferData) {
    const {
      payerUserId,
      payeeUserId,
      amount,
      serviceType = 'TRANSFER',
      productType = 'P2P',
      remarks = '',
      createdBy,
      groupId = 'DEFAULT',
    } = transferData;

    const transferId = generateId('TXN');
    const amountInPaise = Math.round(amount * 100);

    try {
      const result = await db.transaction(async (tx) => {
        const payerValidation = await thresholdService.validateAllThresholds(
          payerUserId,
          amount,
          'PAYER',
          groupId
        );
        if (!payerValidation.valid)
          throw new Error(
            `Payer threshold violation: ${payerValidation.errors
              .map(e => e.message)
              .join('; ')}`
          );

        const payeeValidation = await thresholdService.validateAllThresholds(
          payeeUserId,
          amount,
          'PAYEE',
          groupId
        );
        if (!payeeValidation.valid)
          throw new Error(
            `Payee threshold violation: ${payeeValidation.errors
              .map(e => e.message)
              .join('; ')}`
          );


        const payerWallet = await WalletService.getWalletByUserId(payerUserId);
        const payeeWallet = await WalletService.getWalletByUserId(payeeUserId);

        if (!payerWallet || !payeeWallet) throw new Error('Wallet not found');

        const hasSufficient = await WalletService.hasSufficientBalance(
          payerUserId,
          amountInPaise
        );
        if (!hasSufficient) throw new Error('Insufficient balance');


        await WalletService.updateWalletBalance(
          payerWallet.wallet_id,
          amountInPaise,
          'DEBIT',
          transferId,
          tx
        );

        await WalletService.updateWalletBalance(
          payeeWallet.wallet_id,
          amountInPaise,
          'CREDIT',
          transferId,
          tx
        );


        await this.createTransactionHeader(
          {
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
          },
          tx
        );


        await this.createTransactionItem(
          {
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
          },
          tx
        );

        await this.createTransactionItem(
          {
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
          },
          tx
        );

        return {
          success: true,
          transferId,
          amount,
          payerBalance: (Number(payerWallet.balance) - amountInPaise) / 100,
          payeeBalance: (Number(payeeWallet.balance) + amountInPaise) / 100,
        };
      });

      return result;
    } catch (error) {
      console.error('TransactionService.processTransfer failed:', error);
      throw error;
    }
  }

  
  
  async createTransactionHeader(data, tx = db) {
    try {
      const dbContext = tx || db;
      

      const transactionData = {
        transferId: data.transferId, 
        transferOn: new Date(),
        payerUserId: data.payerUserId,
        payerAccountId: null,
        payeeUserId: data.payeeUserId,
        payeeAccountId: null,
        requestedValue: data.amount,
        errorCode: null,
        transferStatus: data.transferStatus || 'PENDING',
        serviceType: data.serviceType,
        productId: data.productId || null,
        serviceProvider: data.serviceProvider || null,
        productType: data.productType || null,
        rechargeType: data.rechargeType || null,
        details1: data.details1 || null,
        details2: null,
        details3: null,
        createdBy: data.createdBy || null,
        createdOn: new Date().toISOString().slice(0, 19).replace('T', ' '),
        remarks: null,
        totalCommission: null,
        totalServiceCharge: null,
      };
  
      console.log('Inserting transaction header with transferId:', transactionData.transferId);
  
      await dbContext.insert(itnTransactionHeader).values(transactionData);
  
      return {
        transferId: data.transferId,
        status: 'created',
      };
    } catch (error) {
      console.error('Error creating transaction header:', error);
      throw new Error(`Failed to create transaction header: ${error.message}`);
    }
  }

 
  async createTransactionItem(data, tx = db) {
    const record = {
      transferId: data.transferId,
      partyId: data.partyId,
      secondPartyId: data.secondParty,
      userType: data.userType,
      transactionType: data.transactionType,
      approvedValue: data.approvedValue,
      serviceType: data.serviceType,
      productType: data.productType,
      previousBalance: data.previousBalance,
      postBalance: data.postBalance,
      createdOn: new Date(),
    };

    const result = await tx.insert(itnTransactionItems).values(record);
    const insertedId = result.insertId;

    return {
      ...record,
      id: insertedId,
    };
  }

  async updateTransactionStatus(transferId, status, remarks, tx = db) {
    await tx
      .update(itnTransactionHeader)
      .set({
        transferStatus: status,
        remarks,
        modifiedOn: new Date(),
      })
      .where(eq(itnTransactionHeader.transferId, transferId));
  }
}


export const transactionService = new TransactionService();
