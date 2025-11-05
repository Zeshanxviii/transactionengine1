// src/services/thresholdService.js
import { eq, and, gte, lte } from 'drizzle-orm';
import { db } from '../database/db.js';
import { 
  itnThresholdsProfiles, 
  itnThresholdsProfileDtls, 
  itnChannelUsers,
  itnTransactionHeader 
} from '../database/schema/schema.js';

export class ThresholdService {
  // Get user's threshold profile
  async getUserThresholdProfile(userId) {
    try {
      const user = await db.select()
        .from(itnChannelUsers)
        .where(eq(itnChannelUsers.userId, userId))
        .limit(1);
      
      if (!user.length || !user[0].thresProfileId) {
        throw new Error('No threshold profile assigned to user');
      }

      const profile = await db.select()
        .from(itnThresholdsProfiles)
        .where(eq(itnThresholdsProfiles.thresProfileId, user[0].thresProfileId))
        .limit(1);

      if (!profile.length) {
        throw new Error('Threshold profile not found');
      }

      return { user: user[0], profile: profile[0] };
    } catch (error) {
      throw new Error(`Failed to get threshold profile: ${error.message}`);
    }
  }

  // Get threshold details for a profile and group
  async getThresholdDetails(thresProfileId, groupId = 'DEFAULT') {
    try {
      const details = await db.select()
        .from(itnThresholdsProfileDtls)
        .where(and(
          eq(itnThresholdsProfileDtls.thresProfileId, thresProfileId),
          eq(itnThresholdsProfileDtls.groupId, groupId)
        ))
        .limit(1);

      if (!details.length) {
        throw new Error('Threshold configuration not found for group: ' + groupId);
      }

      return details[0];
    } catch (error) {
      throw new Error(`Failed to get threshold details: ${error.message}`);
    }
  }

  // Get date range for different periods
  getDateRange(period = 'DAILY') {
    const now = new Date();
    let startDate, endDate;

    switch (period.toUpperCase()) {
      case 'DAILY':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
        break;

      case 'WEEKLY':
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
        break;

      case 'MONTHLY':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;

      default:
        throw new Error('Invalid period. Use DAILY, WEEKLY, or MONTHLY');
    }

    return { startDate, endDate };
  }

  // Count transactions within a period
  async countTransactionsInPeriod(userId, period = 'DAILY', role = 'PAYER') {
    try {
      const { startDate, endDate } = this.getDateRange(period);

      const condition = role === 'PAYER'
        ? eq(itnTransactionHeader.payerUserId, userId)
        : eq(itnTransactionHeader.payeeUserId, userId);

      const transactions = await db.select()
        .from(itnTransactionHeader)
        .where(and(
          condition,
          gte(itnTransactionHeader.transferOn, startDate),
          lte(itnTransactionHeader.transferOn, endDate),
          eq(itnTransactionHeader.transferStatus, 'SUCCESS')
        ));

      return transactions.length;
    } catch (error) {
      throw new Error(`Failed to count transactions: ${error.message}`);
    }
  }

  // Sum transaction amounts within a period
  async sumTransactionsInPeriod(userId, period = 'DAILY', role = 'PAYER') {
    try {
      const { startDate, endDate } = this.getDateRange(period);

      const condition = role === 'PAYER'
        ? eq(itnTransactionHeader.payerUserId, userId)
        : eq(itnTransactionHeader.payeeUserId, userId);

      const transactions = await db.select()
        .from(itnTransactionHeader)
        .where(and(
          condition,
          gte(itnTransactionHeader.transferOn, startDate),
          lte(itnTransactionHeader.transferOn, endDate),
          eq(itnTransactionHeader.transferStatus, 'SUCCESS')
        ));

      return transactions.reduce((sum, txn) => sum + Number(txn.requestedValue), 0);
    } catch (error) {
      throw new Error(`Failed to sum transactions: ${error.message}`);
    }
  }

  // Validate all thresholds (Daily, Weekly, Monthly)
  async validateAllThresholds(userId, amount, role = 'PAYER', groupId = 'DEFAULT') {
    try {
      const { profile } = await this.getUserThresholdProfile(userId);
      const threshold = await this.getThresholdDetails(profile.thresProfileId, groupId);

      const amountInPaise = Math.round(amount * 100);
      const errors = [];

      // Determine which thresholds to check based on role
      const payerAmt = Number(threshold.payerAmt);
      const payerCount = Number(threshold.payerCount);
      const payeeAmt = Number(threshold.payeeAmt);
      const payeeCount = Number(threshold.payeeCount);

      const limitAmount = role === 'PAYER' ? payerAmt : payeeAmt;
      const limitCount = role === 'PAYER' ? payerCount : payeeCount;

      // Validate DAILY
      const dailyCount = await this.countTransactionsInPeriod(userId, 'DAILY', role);
      const dailyAmount = await this.sumTransactionsInPeriod(userId, 'DAILY', role);

      if (amountInPaise > limitAmount) {
        errors.push({
          period: 'DAILY',
          type: 'AMOUNT',
          limit: limitAmount,
          current: amountInPaise,
          message: `Daily amount limit exceeded. Limit: ₹${limitAmount / 100}, Requested: ₹${amount}`,
        });
      }

      if (dailyCount >= limitCount && dailyCount > 0) {
        errors.push({
          period: 'DAILY',
          type: 'COUNT',
          limit: limitCount,
          current: dailyCount,
          message: `Daily transaction count limit exceeded. Limit: ${limitCount}, Current: ${dailyCount}`,
        });
      }

      if (dailyAmount + amountInPaise > limitAmount) {
        errors.push({
          period: 'DAILY',
          type: 'CUMULATIVE',
          limit: limitAmount,
          current: dailyAmount + amountInPaise,
          message: `Daily cumulative amount limit exceeded. Limit: ₹${limitAmount / 100}, Would be: ₹${(dailyAmount + amountInPaise) / 100}`,
        });
      }

      // Validate WEEKLY
      const weeklyCount = await this.countTransactionsInPeriod(userId, 'WEEKLY', role);
      const weeklyAmount = await this.sumTransactionsInPeriod(userId, 'WEEKLY', role);
      const weeklyLimitCount = limitCount * 7; // Assuming weekly is 7x daily
      const weeklyLimitAmount = limitAmount * 7;

      if (weeklyCount >= weeklyLimitCount && weeklyCount > 0) {
        errors.push({
          period: 'WEEKLY',
          type: 'COUNT',
          limit: weeklyLimitCount,
          current: weeklyCount,
          message: `Weekly transaction count limit exceeded. Limit: ${weeklyLimitCount}, Current: ${weeklyCount}`,
        });
      }

      if (weeklyAmount + amountInPaise > weeklyLimitAmount) {
        errors.push({
          period: 'WEEKLY',
          type: 'CUMULATIVE',
          limit: weeklyLimitAmount,
          current: weeklyAmount + amountInPaise,
          message: `Weekly cumulative amount limit exceeded.`,
        });
      }

      // Validate MONTHLY
      const monthlyCount = await this.countTransactionsInPeriod(userId, 'MONTHLY', role);
      const monthlyAmount = await this.sumTransactionsInPeriod(userId, 'MONTHLY', role);
      const monthlyLimitCount = limitCount * 30; // Assuming monthly is 30x daily
      const monthlyLimitAmount = limitAmount * 30;

      if (monthlyCount >= monthlyLimitCount && monthlyCount > 0) {
        errors.push({
          period: 'MONTHLY',
          type: 'COUNT',
          limit: monthlyLimitCount,
          current: monthlyCount,
          message: `Monthly transaction count limit exceeded.`,
        });
      }

      if (monthlyAmount + amountInPaise > monthlyLimitAmount) {
        errors.push({
          period: 'MONTHLY',
          type: 'CUMULATIVE',
          limit: monthlyLimitAmount,
          current: monthlyAmount + amountInPaise,
          message: `Monthly cumulative amount limit exceeded.`,
        });
      }

      if (errors.length > 0) {
        return {
          valid: false,
          errors,
          message: `${errors.length} threshold limit(s) violated`,
        };
      }

      return {
        valid: true,
        threshold,
        dailyStats: { count: dailyCount, amount: dailyAmount / 100 },
        weeklyStats: { count: weeklyCount, amount: weeklyAmount / 100 },
        monthlyStats: { count: monthlyCount, amount: monthlyAmount / 100 },
      };
    } catch (error) {
      throw new Error(`Threshold validation failed: ${error.message}`);
    }
  }

  // Create threshold profile
  async createThresholdProfile(data) {
    try {
      return await db.insert(itnThresholdsProfiles).values({
        thresProfileId: data.thresProfileId,
        name: data.name,
        userType: data.userType,
        status: data.status || 'ACTIVE',
      });
    } catch (error) {
      throw new Error(`Failed to create threshold profile: ${error.message}`);
    }
  }

  // Create threshold details
  async createThresholdDetails(data) {

    const shortId = Math.random().toString(36).substring(2, 8); // 6 chars
    const thresProfileDtlsId = `THDL_${shortId}${Date.now().toString().slice(-6)}`;
    try {
      return await db.insert(itnThresholdsProfileDtls).values({
        thresProfileDtlsId,
        thresProfileId: data.thresProfileId,
        groupId: data.groupId || 'DEFAULT',
        payerCount: BigInt(data.payerCount),
        payerAmt: BigInt(data.payerAmt),
        payeeCount: BigInt(data.payeeCount),
        payeeAmt: BigInt(data.payeeAmt),
      });
    } catch (error) {
      throw new Error(`Failed to create threshold details: ${error.message}`);
    }
  }

  // Update threshold details
  async updateThresholdDetails(thresProfileDtlsId, data) {
    try {
      return await db.update(itnThresholdsProfileDtls)
        .set({
          payerCount: data.payerCount ? BigInt(data.payerCount) : undefined,
          payerAmt: data.payerAmt ? BigInt(data.payerAmt) : undefined,
          payeeCount: data.payeeCount ? BigInt(data.payeeCount) : undefined,
          payeeAmt: data.payeeAmt ? BigInt(data.payeeAmt) : undefined,
        })
        .where(eq(itnThresholdsProfileDtls.thresProfileDtlsId, thresProfileDtlsId));
    } catch (error) {
      throw new Error(`Failed to update threshold details: ${error.message}`);
    }
  }

  // Get user's remaining limits
  async getUserRemainingLimits(userId, role = 'PAYER', groupId = 'DEFAULT') {
    try {
      const { profile } = await this.getUserThresholdProfile(userId);
      const threshold = await this.getThresholdDetails(profile.thresProfileId, groupId);

      const limitAmount = role === 'PAYER' 
        ? Number(threshold.payerAmt) 
        : Number(threshold.payeeAmt);
      const limitCount = role === 'PAYER' 
        ? Number(threshold.payerCount) 
        : Number(threshold.payeeCount);

      const dailyCount = await this.countTransactionsInPeriod(userId, 'DAILY', role);
      const dailyAmount = await this.sumTransactionsInPeriod(userId, 'DAILY', role);
      const weeklyCount = await this.countTransactionsInPeriod(userId, 'WEEKLY', role);
      const weeklyAmount = await this.sumTransactionsInPeriod(userId, 'WEEKLY', role);
      const monthlyCount = await this.countTransactionsInPeriod(userId, 'MONTHLY', role);
      const monthlyAmount = await this.sumTransactionsInPeriod(userId, 'MONTHLY', role);

      return {
        daily: {
          countRemaining: Math.max(0, limitCount - dailyCount),
          amountRemaining: (limitAmount - dailyAmount) / 100,
          countUsed: dailyCount,
          amountUsed: dailyAmount / 100,
        },
        weekly: {
          countRemaining: Math.max(0, limitCount * 7 - weeklyCount),
          amountRemaining: (limitAmount * 7 - weeklyAmount) / 100,
          countUsed: weeklyCount,
          amountUsed: weeklyAmount / 100,
        },
        monthly: {
          countRemaining: Math.max(0, limitCount * 30 - monthlyCount),
          amountRemaining: (limitAmount * 30 - monthlyAmount) / 100,
          countUsed: monthlyCount,
          amountUsed: monthlyAmount / 100,
        },
      };
    } catch (error) {
      throw new Error(`Failed to get remaining limits: ${error.message}`);
    }
  }
}

export const thresholdService = new ThresholdService();