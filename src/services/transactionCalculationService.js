// src/services/transactionCalculationService.js

import { eq, and } from 'drizzle-orm';
import { db } from '../database/db.js';
import {
  itnProductCommissions,
  itnServiceChargeDetails,
  itnMnytfrSrvchrg,
  itnMnytfrSrvcrhgDtls,
} from '../database/schema/schema.js';

export class TransactionCalculationService {
  /**
   * Step 2: Calculate All Costs
   * Determines: Commission, Service Charge, Taxes
   */
  async calculateTransactionCosts(data) {
    const {
      amount,
      productId,
      productType,
      serviceProvider,
      rechargeType,
      userType,
      userCategory,
    } = data;

    console.log('💰 Step 2: CALCULATE COSTS & CHARGES');
    const amountInPaise = Math.round(amount * 100);

    try {
      // 2.1: Get Commission
      console.log('  ✓ Calculating commission...');
      const commission = await this.getCommission({
        productId,
        productType,
        serviceProvider,
        rechargeType,
        userType,
        userCategory,
      });

      // 2.2: Get Service Charge
      console.log('  ✓ Calculating service charge...');
      const serviceCharge = await this.getServiceCharge({
        amount: amountInPaise,
        productType,
        serviceProvider,
        userCategory,
      });

      // 2.3: Calculate Taxes (GST at 18%)
      console.log('  ✓ Calculating taxes...');
      const gst = Math.round((commission + serviceCharge) * 0.18);

      // 2.4: Calculate Final Cost
      const totalCost = commission + serviceCharge + gst;
      const finalAmount = amountInPaise + totalCost;

      return {
        success: true,
        breakdown: {
          originalAmount: amountInPaise,
          commission: {
            amount: commission,
            percentage: ((commission / amountInPaise) * 100).toFixed(2) + '%',
          },
          serviceCharge: {
            amount: serviceCharge,
          },
          gst: {
            amount: gst,
            rate: '18%',
          },
          totalCost,
          finalAmount,
        },
        message: 'Costs calculated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        message: 'Cost calculation failed',
      };
    }
  }

  /**
   * Get Commission for Product/User Type
   */
  async getCommission(filter) {
    try {
      const commissions = await db.select()
        .from(itnProductCommissions)
        .where(and(
          eq(itnProductCommissions.productId, filter.productId),
          eq(itnProductCommissions.productType, filter.productType),
          eq(itnProductCommissions.serviceProvider, filter.serviceProvider),
          eq(itnProductCommissions.rechargeType, filter.rechargeType),
          eq(itnProductCommissions.userType, filter.userType),
          eq(itnProductCommissions.userCategory, filter.userCategory),
          eq(itnProductCommissions.status, 'ACTIVE')
        ))
        .limit(1);

      if (!commissions.length) {
        console.warn('⚠️  No commission found, using default (0)');
        return 0;
      }

      return Number(commissions[0].commission) || 0;
    } catch (error) {
      console.warn('Commission lookup error:', error.message);
      return 0;
    }
  }

  /**
   * Get Service Charge based on Amount Range
   */
  async getServiceCharge(filter) {
    try {
      const chargeDetails = await db.select()
        .from(itnServiceChargeDetails)
        .where(and(
          eq(itnServiceChargeDetails.productType, filter.productType),
          eq(itnServiceChargeDetails.serviceProvider, filter.serviceProvider),
          eq(itnServiceChargeDetails.userCategory, filter.userCategory),
          eq(itnServiceChargeDetails.status, 'Y')
        ));

      // Find matching amount range
      for (const detail of chargeDetails) {
        if (
          filter.amount >= Number(detail.fromAmt) &&
          filter.amount <= Number(detail.toAmt)
        ) {
          return Number(detail.serviceCharge) || 0;
        }
      }

      console.warn('⚠️  No service charge found for amount range, using 0');
      return 0;
    } catch (error) {
      console.warn('Service charge lookup error:', error.message);
      return 0;
    }
  }

  /**
   * Get Money Transfer Service Charge (if applicable)
   */
  async getMoneyTransferCharge(amount) {
    try {
      const chargeDetails = await db.select()
        .from(itnMnytfrSrvcrhgDtls)
        .where(and(
          eq(itnMnytfrSrvcrhgDtls.status, 'Y')
        ));

      for (const detail of chargeDetails) {
        if (
          amount >= Number(detail.fromAmt) &&
          amount <= Number(detail.toAmt)
        ) {
          return Number(detail.srvcAmt1) || 0; // Using first user category charge
        }
      }

      return 0;
    } catch (error) {
      console.warn('Money transfer charge error:', error.message);
      return 0;
    }
  }
}

export const transactionCalculationService = new TransactionCalculationService();