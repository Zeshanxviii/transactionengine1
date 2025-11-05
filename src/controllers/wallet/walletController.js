import { walletService} from '../../services/walletService.js';


export const createWallet = async (req, res) => {
  try {
    const { userId, walletType } = req.body;

    const result = await walletService.createWallet(userId, walletType);

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Create wallet error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create wallet',
    });
  }
};

export const fetchBalance =  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { walletType } = req.query;

      const balance = await walletService.getBalance(userId, walletType);

      res.json({
        success: true,
        data: balance,
      });
    } catch (error) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get balance',
      });
    }
  }


export const getWalletBalance =  async (req, res) => {
    try {
      const userId = req.user.userId;
      const { walletType } = req.query;

      const wallet = await walletService.getWalletByUserId(userId, walletType);

      if (!wallet) {
        return res.status(404).json({
          success: false,
          message: 'Wallet not found',
        });
      }

      res.json({
        success: true,
        data: {
          walletId: wallet.wallet_id,
          userId: wallet.user_id,
          walletType: wallet.wallet_type,
          balance: Number(wallet.balance) / 100,
          netCredit: Number(wallet.net_credit) / 100,
          netDebit: Number(wallet.net_debit) / 100,
          status: wallet.status,
          lastTransactionOn: wallet.last_transation_on,
        },
      });
    } catch (error) {
      console.error('Get wallet details error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get wallet details',
      });
    }
  }

  export const checkSufficentBalance = async (req, res) => {
    try {
      const userId = req.user.userId;
      const { amount, walletType } = req.body;

      const amountInPaise = Math.round(amount * 100);
      const hasSufficient = await walletService.hasSufficientBalance(
        userId,
        amountInPaise,
        walletType
      );

      res.json({
        success: true,
        data: {
          hasSufficientBalance: hasSufficient,
          requestedAmount: amount,
        },
      });
    } catch (error) {
      console.error('Check balance error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to check balance',
      });
    }
  }


