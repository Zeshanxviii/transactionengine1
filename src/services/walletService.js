// services/walletService.js
import { db } from '../database/db.js';
import { itnWallet, itnChannelUsers } from '../database/schema/schema.js';
import { eq, and } from 'drizzle-orm';
import { generateId } from '../utils/idGenerator.js';

export class WalletService {
  // Create a new wallet for a user
  async createWallet(userId, walletType = 'MAIN') {
    const user = await db.select()
      .from(itnChannelUsers)
      .where(eq(itnChannelUsers.userId, userId))
      .limit(1);
    
    if (!user.length) {
      throw new Error('User not found');
    }
    const walletId = generateId('WLT');
    
    await db.insert(itnWallet).values({
      walletId: walletId,
      userId: userId,
      userType: user[0].userType,
      msisdn: user[0].msisdn,
      walletType: walletType,
      prevBalance: 0,
      balance: 0,
      netCredit: 0,
      netDebit: 0,
      status: 'A',
      walletLimit: 1000000, // 10,000 in paise (100 paise = 1 rupee)
      firstTransationOn: new Date(),
    });

    return { walletId, message: 'Wallet created successfully' };
  }

  // Get wallet balance
  async getBalance(userId, walletType = 'MAIN') {
    const wallet = await db.select()
      .from(itnWallet)
      .where(
        and(
          eq(itnWallet.userId, userId),
          eq(itnWallet.walletType, walletType),
          eq(itnWallet.status, 'A')
        )
      )
      .limit(1);

    if (!wallet.length) {
      throw new Error('Wallet not found');
    }

    return {
      walletId: wallet[0].walletId,
      balance: Number(wallet[0].balance) / 100, // Convert paise to rupees
      balanceInPaise: Number(wallet[0].balance),
      walletType: wallet[0].walletType,
      status: wallet[0].status,
    };
  }

  // Check if user has sufficient balance
  async hasSufficientBalance(userId, amount, walletType = 'MAIN') {
    const wallet = await this.getBalance(userId, walletType);
    return wallet.balanceInPaise >= amount;
  }

  // Get wallet by user ID
  async getWalletByUserId(userId, walletType = 'MAIN') {
    const wallet = await db.select()
      .from(itnWallet)
      .where(
        and(
          eq(itnWallet.userId, userId),
          eq(itnWallet.walletType, walletType),
          eq(itnWallet.status, 'A')
        )
      )
      .limit(1);

    if (!wallet.length) {
      return null;
    }

    return wallet[0];
  }

  // Update wallet balance (internal method)
  // async updateWalletBalance(walletId, amount, transactionType, transactionId) {
  //   return await db.transaction(async (tx) => {
  //     // 1. Fetch wallet and lock the row for update
  //     const wallet = await tx.select()
  //       .from(itnWallet)
  //       .where(eq(itnWallet.walletId, walletId))
  //       .for('update') // locks the row until transaction completes
  //       .limit(1);
  // console.log("This is wallet service",wallet);
  //     if (!wallet.length) {
  //       throw new Error('Wallet not found');
  //     }
  
  //     const currentBalance = Number(wallet[0].balance) || 0;
  //     const netCredit = Number(wallet[0].netCredit) || 0;
  //     const netDebit = Number(wallet[0].netDebit) || 0;
  
  //     let newBalance;
  //     let updatedNetCredit = netCredit;
  //     let updatedNetDebit = netDebit;
  
  //     // 2. Calculate new balances safely
  //     if (transactionType === 'CREDIT') {
  //       newBalance = currentBalance + amount;
  //       updatedNetCredit = netCredit + amount;
  //     } else if (transactionType === 'DEBIT') {
  //       if (currentBalance < amount) {
  //         throw new Error('Insufficient balance');
  //       }
  //       newBalance = currentBalance - amount;
  //       updatedNetDebit = netDebit + amount;
  //     } else {
  //       throw new Error('Invalid transaction type');
  //     }
  
  //     // 3. Update wallet inside the same transaction
  //     await tx.update(itnWallet)
  //       .set({
  //         prevBalance: currentBalance,
  //         balance: newBalance,
  //         netCredit: updatedNetCredit,
  //         netDebit: updatedNetDebit,
  //         lastTransactionType: transactionType,
  //         lastTransactionId: transactionId,
  //         lastTransactionOn: new Date(),
  //       })
  //       .where(eq(itnWallet.walletId, walletId));
  
  //     // 4. Return result
  //     return {
  //       previousBalance: currentBalance,
  //       newBalance,
  //       amount,
  //       transactionType,
  //     };
  //   });
  // }

   async updateWalletBalance(walletId, amount, transactionType, transactionId) {
    // Ensure amount is a number
    amount = Number(amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('Invalid amount');
    }

    return await db.transaction(async (tx) => {
      // 1️⃣ Fetch wallet and lock the row
      const wallets = await tx.select()
        .from(itnWallet)
        .where(eq(itnWallet.walletId, walletId))
        .for('update')
        .limit(1);

      if (!wallets.length) {
        throw new Error('Wallet not found');
      }

      const wallet = wallets[0];
      const currentBalance = Number(wallet.balance) || 0;
      const netCredit = Number(wallet.netCredit) || 0;
      const netDebit = Number(wallet.netDebit) || 0;

      // 2️⃣ Calculate new balances
      let newBalance;
      let updatedNetCredit = netCredit;
      let updatedNetDebit = netDebit;

      if (transactionType === 'CREDIT') {
        newBalance = currentBalance + amount;
        updatedNetCredit += amount;
      } else if (transactionType === 'DEBIT') {
        if (currentBalance < amount) {
          throw new Error('Insufficient balance');
        }
        newBalance = currentBalance - amount;
        updatedNetDebit += amount;
      } else {
        throw new Error('Invalid transaction type');
      }

      // 3️⃣ Update wallet safely inside the same transaction
      await tx.update(itnWallet)
        .set({
          prevBalance: currentBalance,
          balance: newBalance,
          netCredit: updatedNetCredit,
          netDebit: updatedNetDebit,
          lastTransactionType: transactionType,
          lastTransactionId: transactionId,
          lastTransactionOn: new Date(),
        })
        .where(eq(itnWallet.walletId, walletId));

      // 4️⃣ Return result
      return {
        previousBalance: currentBalance,
        newBalance,
        amount,
        transactionType,
      };
    });
  }
  
}


export const walletService = new WalletService();