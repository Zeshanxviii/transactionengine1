// get transaction detail by transaction id
import { transactionService } from '../../services/transactionService.js';
import { subscriberService } from '../../services/subscriberService.js'
import * as userService from '../../services/userService.js'
import { walletService } from '../../services/walletService.js'
import { productService } from '../../services/productService.js'
import bcrypt from 'bcrypt';
import { serviceTypeService } from '../../services/serviceTypeService.js'
import { itnChannelUsers } from '../../database/schema/schema.js';
import { db } from '../../database/db.js'
import crypto from 'crypto';


export const fetchTransactionDetail = async (req, res) => {
    try {
      const { transferId } = req.params;

      const transaction = await transactionService.getTransaction(transferId);

      // Check if user has permission to view this transaction
      if (
        transaction.payer_user_id !== req.user.userId &&
        transaction.payee_user_id !== req.user.userId &&
        req.user.userType !== 'ADMIN'
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this transaction',
        });
      }

      res.json({
        success: true,
        data: {
          transferId: transaction.transfer_id,
          transferOn: transaction.transfer_on,
          payerUserId: transaction.payer_user_id,
          payeeUserId: transaction.payee_user_id,
          amount: Number(transaction.requested_value) / 100,
          status: transaction.transfer_status,
          serviceType: transaction.service_type,
          productType: transaction.product_type,
          errorCode: transaction.error_code,
          remarks: transaction.remarks,
          createdOn: transaction.created_on,
        },
      });
    } catch (error) {
      console.error('Get transaction error:', error);
      
      if (error.message === 'Transaction not found') {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get transaction',
      });
    }
  }

export const fetchTransactionHistry = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { limit, page, status, startDate, endDate } = req.query;

      const transactions = await transactionService.getUserTransactions(
        userId,
        limit,
        { page, status, startDate, endDate }
      );

      res.json({
        success: true,
        data: transactions,
        count: transactions.length,
        pagination: {
          page: page || 1,
          limit: limit || 50,
        },
      });
    } catch (error) {
      console.error('Get transaction history error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get transaction history',
      });
    }
  }

export const fetchAllTransaction =  async (req, res) => {
    try {
      const { limit, page, status, startDate, endDate } = req.query;

      // Admin can see all transactions
      const transactions = await transactionService.getAllTransactions(
        limit,
        { page, status, startDate, endDate }
      );

      res.json({
        success: true,
        data: transactions,
        count: transactions.length,
        pagination: {
          page: page || 1,
          limit: limit || 50,
        },
      });
    } catch (error) {
      console.error('Get all transactions error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get transactions',
      });
    }
  }

export const fetchTransactionStatus =  async (req, res) => {
    try {
      const { transferId } = req.params;

      const transaction = await transactionService.getTransaction(transferId);

      // Check permission
      if (
        transaction.payer_user_id !== req.user.userId &&
        transaction.payee_user_id !== req.user.userId &&
        req.user.userType !== 'ADMIN'
      ) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to view this transaction',
        });
      }

      res.json({
        success: true,
        data: {
          transferId: transaction.transfer_id,
          status: transaction.transfer_status,
          errorCode: transaction.error_code,
          amount: Number(transaction.requested_value) / 100,
          transferOn: transaction.transfer_on,
        },
      });
    } catch (error) {
      console.error('Get transaction status error:', error);
      
      if (error.message === 'Transaction not found') {
        return res.status(404).json({
          success: false,
          message: 'Transaction not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get transaction status',
      });
    }
  }
  export const RechargeRequest = async (req, res) => {
    const channelUserId = req.user.userId;
  
    const {
      productId,
      mobileNumber,
      amount,
      operator,
      productType, 
      rechargeType, 
      tx_pin,     
      serviceId
    } = req.body;
  
    console.log('Recharge Request Body:', req.body);
  
    if (
      !mobileNumber ||
      !amount ||
      !operator ||
      !productType ||
      !rechargeType ||
      !tx_pin ||
      !serviceId ||
      !productId
    ) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: mobileNumber, amount, operator, productType, rechargeType, and tx_pin are all required.',
      });
    }
  
    const rechargeAmount = parseFloat(amount);
    if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recharge amount.' 
      });
    }
  
    let subscriber;
    let subscriberWallet;
    let merchant;
    let merchantWallet;
    let product;
    let serviceType;
  
    try {
      merchant = await userService.getUserById(channelUserId);
      if (!merchant) {
        return res.status(401).json({ 
          success: false, 
          message: 'Merchant account not found.' 
        });
      }
  
      if (merchant.status !== 'ACTIVE') {
        return res.status(403).json({ 
          success: false, 
          message: 'Merchant account is not active.' 
        });
      }
  
      const isPinValid = await bcrypt.compare(tx_pin.toString(), merchant.txnPin);
      if (!isPinValid) {
        return res.status(403).json({ 
          success: false, 
          message: 'Invalid transaction PIN.' 
        });
      }
  
      merchantWallet = await walletService.getWalletByUserId(channelUserId);
      console.log("Merchant Wallet:", merchantWallet);
  
      if (!merchantWallet) {
        return res.status(404).json({ 
          success: false, 
          message: 'Merchant wallet not found.' 
        });
      }
  
      if (merchantWallet.status !== 'A') {
        return res.status(403).json({ 
          success: false, 
          message: 'Merchant wallet is not active.' 
        });
      }
  
      subscriber = await subscriberService.getSubscriberByMsisdn(mobileNumber);
      
      if (!subscriber) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscriber account not found.' 
        });
      }
  
      if (subscriber.status !== 'Active') {
        return res.status(403).json({ 
          success: false, 
          message: 'Subscriber account is not active.' 
        });
      }
  
      subscriberWallet = await walletService.getWalletByUserId(subscriber.subscriberId);
      console.log("Subscriber Wallet:", subscriberWallet);
  
      if (!subscriberWallet) {
        return res.status(404).json({ 
          success: false, 
          message: 'Subscriber wallet not found.' 
        });
      }
  
      if (subscriberWallet.status !== 'A') {
        return res.status(403).json({ 
          success: false, 
          message: 'Subscriber wallet is not active.' 
        });
      }
  
      const subscriberBalance = Number(subscriberWallet.balance);
      if (subscriberBalance < rechargeAmount) {
        return res.status(400).json({
          success: false,
          message: 'Insufficient subscriber wallet balance.',
          currentBalance: subscriberBalance,
          requestedAmount: rechargeAmount,
        });
      }
  
      product = await productService.getProductById(productId);
  
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Recharge product/operator not found or not supported.',
        });
      }
  
      if (product.status !== 'Y') {
        return res.status(400).json({
          success: false,
          message: 'This service is temporarily unavailable.',
        });
      }
  
      serviceType = await serviceTypeService.getServiceTypeById(serviceId);
  
      if (!serviceType) {
        return res.status(404).json({
          success: false,
          message: 'Service type not found.',
        });
      }
  
    } catch (error) {
      console.error('Validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to validate merchant, subscriber, or wallet.',
        error: error.message,
      });
    }
  
    let transferId;
    
    try {
      await db.transaction(async (tx) => {
        transferId = crypto.randomUUID();
        console.log('Starting transaction:', transferId);
  
        const txnHeader = await transactionService.createTransactionHeader({
          transferId: transferId,
          payerUserId: subscriber.subscriberId,  
          payeeUserId: merchant.userId,          
          amount: rechargeAmount,
          serviceType: serviceType.serviceType,
          productId: productId,
          productType: productType,
          serviceProvider: operator,
          rechargeType: rechargeType,
          transferStatus: 'PENDING',
          details1: mobileNumber, 
          createdBy: merchant.firstName,
        }, tx);
  
        const txnId = txnHeader.transferId;
        console.log('Transaction header created:', txnId);
  
        const subscriberPreviousBalance = Number(subscriberWallet.balance);
        const subscriberPostBalance = subscriberPreviousBalance - rechargeAmount;
  
        await walletService.updateWalletBalance(
          subscriberWallet.walletId, 
          rechargeAmount,
          'DEBIT',
          txnId,
          tx
        );
        console.log('Subscriber wallet debited:', rechargeAmount);
  
        await transactionService.createTransactionItem({
          transferId: txnId,
          partyId: subscriber.subscriberId,      
          secondParty: merchant.userId,          
          userType: subscriberWallet.userType || 'SUBSCRIBER',
          userCategory: subscriberWallet.categoryCode || 'SUB',
          transactionType: 'DEBIT',
          approvedValue: rechargeAmount,
          serviceType: serviceType.serviceType,
          productId: productId,
          productType: productType,
          serviceProvider: operator,
          rechargeType: rechargeType,
          previousBalance: subscriberPreviousBalance,
          postBalance: subscriberPostBalance,
          transferStatus: 'SUCCESS',
        }, tx);
        console.log('Subscriber transaction item created (DEBIT)');
  
        const merchantPreviousBalance = Number(merchantWallet.balance);
        const merchantPostBalance = merchantPreviousBalance + rechargeAmount;
  
        await walletService.updateWalletBalance(
          merchantWallet.walletId,    
          rechargeAmount,
          'CREDIT',
          txnId,
          tx
        );
        console.log('Merchant wallet credited:', rechargeAmount);
  
        await transactionService.createTransactionItem({
          transferId: txnId,
          partyId: merchant.userId,              
          secondParty: subscriber.subscriberId,  
          userType: merchant.userType,
          userCategory: merchant.categoryCode,
          transactionType: 'CREDIT',
          approvedValue: rechargeAmount,
          serviceType: serviceType.serviceType,
          productId: productId,
          productType: productType,
          serviceProvider: operator,
          rechargeType: rechargeType,
          previousBalance: merchantPreviousBalance,
          postBalance: merchantPostBalance,
          transferStatus: 'SUCCESS',
        }, tx);
        console.log('Merchant transaction item created (CREDIT)');
  
        //external api call
        await transactionService.updateTransactionStatus(
          transferId,
          'SUCCESS',
          'Recharge completed successfully',
          tx
        );
        console.log('Transaction status updated to SUCCESS');
      });
  
      return res.status(200).json({
        success: true,
        message: 'Recharge completed successfully',
        data: {
          transferId: transferId,
          mobileNumber: mobileNumber,
          amount: rechargeAmount,
          operator: operator,
          subscriberBalance: Number(subscriberWallet.balance) - rechargeAmount,
          merchantBalance: Number(merchantWallet.balance) + rechargeAmount,
        }
      });
  
    } catch (error) {
      console.error('Recharge transaction error:', error);
      
      if (transferId) {
        try {
          await transactionService.updateTransactionStatus(
            transferId,
            'FAILED',
            error.message || 'Transaction processing failed'
          );
        } catch (updateError) {
          console.error('Failed to update transaction status:', updateError);
        }
      }
  
      return res.status(500).json({
        success: false,
        message: 'Recharge processing failed',
        error: error.message,
        transferId: transferId,
      });
    }
  };
//   const channelUserId = req.user.userId;

//   const {
//     productId,
//     mobileNumber,
//     amount,
//     operator,
//     productType, 
//     rechargeType, 
//     tx_pin,     
//     serviceId
//   } = req.body;
//  console.log(req.body);
//   if (
//     !mobileNumber ||
//     !amount ||
//     !operator ||
//     !productType ||
//     !rechargeType ||
//     !tx_pin ||
//     !serviceId ||
//     !productId
//   ) {
//     return res.status(400).json({
//       success: false,
//       message:
//         'Missing required fields: mobileNumber, amount, operator, productType, rechargeType, and tx_pin are all required.',
//     });
//   }
//   let subscriberWallet;
//   const subscriber = await subscriberService.getSubscriberByMsisdn(mobileNumber);
//   const MerchantWallet = await walletService.getWalletByUserId(channelUserId);
//   console.log("This is merchant wallet" , MerchantWallet)
//   const rechargeAmount = parseFloat(amount);
//   if (isNaN(rechargeAmount) || rechargeAmount <= 0) {
//     return res
//     .status(400)
//     .json({ success: false, message: 'Invalid recharge amount.' });
//   }
  
  
//   let merchant;
//   let merchantWallet;
//   let amountInLowestDenom;
  
//   try {
//     merchant = await userService.getUserById(channelUserId);
//     if (!merchant) {
//       return res
//       .status(401)
//       .json({ success: false, message: 'Merchant account not found.' });
//     }
//     if (merchant.status !== 'ACTIVE') {
//       return res
//       .status(403)
//       .json({ success: false, message: 'Merchant account is not active.' });
//     }
    
    
//     subscriberWallet = await walletService.getWalletByUserId(subscriber.subscriberId);
//     console.log(subscriberWallet.status);
//     if (subscriberWallet.status !== 'A') {
//       return res
//       .status(403)
//       .json({ success: false, message: 'subscriber wallet is not active.' });
//     }
    
//     const isPinValid = await bcrypt.compare(tx_pin.toString(), merchant.txnPin);
    
//     if (!isPinValid) {
//       return res
//       .status(403)
//       .json({ success: false, message: 'Invalid transaction PIN.' });
//     }
    
//     if (!subscriber) {
//       return res
//       .status(401)
//       .json({ success: false, message: 'subscriber account not found.' });
//     }
//     if (subscriber.status !== 'Active') {
//       return res
//       .status(403)
//       .json({ success: false, message: 'Subscriber account is not active.' });
//     }
//     // console.log(merchantWallet.walletId);
    
    
//     if (subscriberWallet.balance < rechargeAmount) {
//       return res.status(400).json({
//         success: false,
//         message: 'Insufficient wallet balance.',
//         currentBalance: merchantWallet.balance,
//         requestedAmount: rechargeAmount,
//       });
//     }
//   } catch (error) {
//     console.error('Validation error:', error);
//     return res
//     .status(500)
//     .json({
//       success: false,
//       message: 'Failed to validate merchant or wallet.',
//     });
//   }

//   let product;
//   try {
//     product = await productService.getProductById(productId);

//     if (!product) {
//       return res.status(404).json({
//         success: false,
//         message: 'Recharge product/operator not found or not supported.',
//       });
//     }
//     if (product.status !== 'Y') {
//       return res.status(400).json({
//         success: false,
//         message: 'This service is temporarily unavailable.',
//       });
//     }
//   } catch (error) {
//     console.error('Product validation error:', error);
//     return res
//       .status(500)
//       .json({ success: false, message: 'Failed to validate product.' });
//   }

//   const serviceType = await serviceTypeService.getServiceTypeById(serviceId);

//   try {
//     await db.transaction(async (tx) => {
//       const transferId = crypto.randomUUID();
//       // Step 1. Create transaction header
//       const txnHeader = await transactionService.createTransactionHeader({
//         transferId: transferId,
//         payerUserId: merchant.userId,
//         payeeUserId: subscriber.subscriberId,
//         amount: amount,
//         serviceType: serviceType.serviceType,
//         transferStatus: 'PENDING',
//         createdBy: merchant.firstName,
//       }, tx);
    
//       const txnId = txnHeader.transferId;
    
//       // Step 2. Debit merchant wallet
//       await walletService.updateWalletBalance(
//         subscriberWallet.walletId,
//         amount,
//         'DEBIT',
//         txnId,
//         tx
//       );
      
    
//       // Step 3. Log merchant debit
//       await transactionService.createTransactionItem({
//         transferId: txnId,
//         partyId: MerchantWallet.userId,
//         secondParty: subscriber.subscriberId,
//         userType: MerchantWallet.userType,
//         transactionType: 'DEBIT',
//         approvedValue: amount,
//         serviceType: serviceType.serviceType,
//         productType,
//         previousBalance: Number(MerchantWallet.balance),
//         postBalance: Number(MerchantWallet.balance) - amount,
//       }, tx);
    
//       // Step 4. Credit subscriber wallet
//       await walletService.updateWalletBalance(
//         subscriberWallet.walletId,
//         amount,
//         'CREDIT',
//         txnId,
//         tx
//       );
    
//       // Step 5. Log subscriber credit
//       await transactionService.createTransactionItem({
//         transferId : txnId,
//         partyId: subscriber.subscriberId,
//         secondParty: merchant.userId,
//         userType: subscriberWallet.user_type,
//         transactionType: 'CREDIT',
//         approvedValue: amount,
//         serviceType: serviceType.serviceType,
//         productType,
//         previousBalance: Number(subscriberWallet.balance),
//         postBalance: Number(subscriberWallet.balance) + amount,
//       }, tx);
    
//       //external api call skip
//       console.log("trans",transferId);
//       console.log("txn",txnId);
      
//       await transactionService.updateTransactionStatus(
//         transferId,
//         'SUCCESS',
//          'Recharge Successful',
//        tx);
//     });
//   } catch (error) {
//     console.error('Recharge transaction error:', error);
//     return res.status(500).json({
//         success: false,
//         message: error.message || 'Recharge processing failed.',
//       });
//   }
// };

export const BillRequest =  async (req, res) => {
    try {
      const {
        serviceProvider,
        consumerNumber,
        amount,
        productType,
        billDetails,
        remarks,
      } = req.body;

      const userId = req.user.userId;

      // TODO: Implement bill payment service integration
      // This would integrate with BBPS or other bill payment APIs

      res.status(501).json({
        success: false,
        message: 'Bill payment service not yet implemented',
        note: 'This endpoint will integrate with BBPS or similar bill payment systems',
        receivedData: {
          userId,
          serviceProvider,
          consumerNumber,
          amount,
          productType,
          billDetails,
          remarks,
        },
      });
    } catch (error) {
      console.error('Bill payment error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Bill payment failed',
      });
    }
  }

export const fetchTransactionStatistics =  async (req, res) => {
    try {
      const userId = req.user.userId;

      // TODO: Implement statistics calculation
      // This would calculate total transactions, amounts, success rate, etc.

      res.json({
        success: true,
        data: {
          totalTransactions: 0,
          successfulTransactions: 0,
          failedTransactions: 0,
          totalAmountTransferred: 0,
          todayTransactions: 0,
          thisMonthTransactions: 0,
        },
        message: 'Statistics calculation not yet implemented',
      });
    } catch (error) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get statistics',
      });
    }
  }

export const MoneyTransferRequest = async (req, res) => {
    try {
      const { payeeUserId, amount, serviceType, productType, remarks } = req.body;
      const payerUserId = req.user.userId;

      // Additional business logic validation
      if (payerUserId === payeeUserId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot transfer to the same account',
        });
      }

      const result = await TransactionService.processTransfer({
        payerUserId,
        payeeUserId,
        amount,
        serviceType,
        productType,
        remarks,
        createdBy: payerUserId,
      });

      res.status(201).json({
        success: true,
        data: result,
        message: 'Transfer completed successfully',
      });
    } catch (error) {
      console.error('Transfer error:', error);
      
      // Handle specific errors
      if (error.message === 'Insufficient balance') {
        return res.status(400).json({
          success: false,
          message: 'Insufficient balance in wallet',
        });
      }

      if (error.message.includes('wallet not found')) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Transfer failed',
      });
    }
  }