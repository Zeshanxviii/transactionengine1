// get transaction detail by transaction id
import { TransactionService } from '../../services/transactionService.js';

export const fetchTransactionDetail = async (req, res) => {
    try {
      const { transferId } = req.params;

      const transaction = await TransactionService.getTransaction(transferId);

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

      const transactions = await TransactionService.getUserTransactions(
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
      const transactions = await TransactionService.getAllTransactions(
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

      const transaction = await TransactionService.getTransaction(transferId);

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

export const RechargeRequest =  async (req, res) => {
    try {
      const {
        productId,
        serviceProvider,
        mobileNumber,
        amount,
        productType,
        operator,
        circle,
      } = req.body;

      const userId = req.user.userId;

      // TODO: Implement recharge service integration
      // This would integrate with third-party recharge APIs
      // For now, return a placeholder response

      res.status(501).json({
        success: false,
        message: 'Recharge service not yet implemented',
        note: 'This endpoint will integrate with recharge APIs like PayTM, Razorpay, etc.',
        receivedData: {
          userId,
          productId,
          serviceProvider,
          mobileNumber,
          amount,
          productType,
          operator,
          circle,
        },
      });
    } catch (error) {
      console.error('Recharge error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Recharge failed',
      });
    }
  }

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