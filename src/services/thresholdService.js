import { eq, and } from 'drizzle-orm';
import { db } from '../database/db.js';
import { 
  thresholdsProfiles, 
  thresholdsProfileDetails, 
  channelUsers,
  transactionHeader 
} from '../db/schema.js';

export class ThresholdService {
  // Get user's threshold profile
  async getUserThresholdProfile(userId) {
    const user = await db.query.channelUsers.findFirst({
      where: eq(channelUsers.userId, userId),
    });
    
    if (!user?.thresProfileId) {
      throw new Error('No threshold profile assigned to user');
    }

    const profile = await db.query.thresholdsProfiles.findFirst({
      where: eq(thresholdsProfiles.thresProfileId, user.thresProfileId),
    });

    return profile;
  }

  // Get threshold details for a profile and group
  async getThresholdDetails(thresProfileId, groupId) {
    return await db.query.thresholdsProfileDetails.findFirst({
      where: and(
        eq(thresholdsProfileDetails.thresProfileId, thresProfileId),
        eq(thresholdsProfileDetails.groupId, groupId)
      ),
    });
  }

  // Validate payer threshold
  async validatePayerThreshold(userId, amount, groupId = 'DEFAULT') {
    const profile = await this.getUserThresholdProfile(userId);
    const threshold = await this.getThresholdDetails(profile.thresProfileId, groupId);

    if (!threshold) {
      throw new Error('Threshold configuration not found');
    }

    // Check amount limit
    if (amount > Number(threshold.payerAmt)) {
      throw new Error(
        `Transaction amount ${amount} exceeds payer limit of ${threshold.payerAmt}`
      );
    }

    // Check daily transaction count
    const todayCount = await this.countUserTransactionsToday(userId, 'PAYER');
    if (todayCount >= Number(threshold.payerCount)) {
      throw new Error(
        `Daily transaction count limit (${threshold.payerCount}) exceeded. Current: ${todayCount}`
      );
    }

    return { valid: true, threshold };
  }

  // Validate payee threshold
  async validatePayeeThreshold(userId, amount, groupId = 'DEFAULT') {
    const profile = await this.getUserThresholdProfile(userId);
    const threshold = await this.getThresholdDetails(profile.thresProfileId, groupId);

    if (!threshold) {
      throw new Error('Threshold configuration not found');
    }

    // Check amount limit
    if (amount > Number(threshold.payeeAmt)) {
      throw new Error(
        `Received amount ${amount} exceeds payee limit of ${threshold.payeeAmt}`
      );
    }

    // Check daily transaction count
    const todayCount = await this.countUserTransactionsToday(userId, 'PAYEE');
    if (todayCount >= Number(threshold.payeeCount)) {
      throw new Error(
        `Daily payee transaction limit (${threshold.payeeCount}) exceeded. Current: ${todayCount}`
      );
    }

    return { valid: true, threshold };
  }

  // Count user transactions today
  async countUserTransactionsToday(userId, role) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const condition = role === 'PAYER'
      ? eq(transactionHeader.payerUserId, userId)
      : eq(transactionHeader.payeeUserId, userId);

    const transactions = await db.query.transactionHeader.findMany({
      where: and(
        condition,
        // Add date filter for today's transactions if applicable
      ),
    });

    return transactions.length;
  }

  // Create threshold profile
  async createThresholdProfile(data) {
    return await db.insert(thresholdsProfiles).values({
      thresProfileId: data.thresProfileId,
      name: data.name,
      userType: data.userType,
      status: data.status,
    });
  }

  // Create threshold details
  async createThresholdDetails(data) {
    return await db.insert(thresholdsProfileDetails).values({
      thresProfileDtlsId: `DTL_${Date.now()}`,
      thresProfileId: data.thresProfileId,
      groupId: data.groupId,
      payerCount: BigInt(data.payerCount),
      payerAmt: BigInt(data.payerAmt),
      payeeCount: BigInt(data.payeeCount),
      payeeAmt: BigInt(data.payeeAmt),
    });
  }
}

export const thresholdService = new ThresholdService();
