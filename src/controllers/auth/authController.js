import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userService from '../../services/userService.js';
import { loginSchema } from '../../validators/auth.validator.js';
import { createUserSchema } from '../../validators/auth.validator.js';
import { generateId } from '../../utils/idGenerator.js';
import { thresholdService } from '../../services/thresholdService.js';
import { walletService } from '../../services/walletService.js';


export async function login(req, res) {
  try {
    const validationResult = loginSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
    const { userId, password } = req.body;

    if (!userId || !password) {
      return res
        .status(400)
        .json({ message: 'User ID and password are required' });
    }

    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const match = bcrypt.compareSync(password, user.password);

    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.userId, userName: user.userName },
      process.env.SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function register(req, res) {
  try {
    const validationResult = createUserSchema.safeParse(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: validationResult.error.issues.map((issue) => ({
          path: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }

    const userData = validationResult.data;
    console.log(userData.userId, 'userData.userId');
    const existingUser = await userService.getUserById(userData.userId);

  
    if (existingUser) {
      return res.status(409).json({ message: "User ID already exists" });
    };

    const saltRounds = Number(process.env.SALT) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const hashedPin = await bcrypt.hash(userData.txnPin, saltRounds);

     // Generate threshold profile ID
     const thresProfileId = generateId('THRES');
     await thresholdService.createThresholdProfile({
      thresProfileId,
      name: `${userData.userName}`,
      userType: userData.userType,
      status: 'A',
    });
    console.log('✓ Threshold profile created:', thresProfileId);


    // 2. Create threshold profile details with default limits
    const defaultLimits = getDefaultLimitsByUserType(userData.userType);
    console.log("default : ",defaultLimits);

    await thresholdService.createThresholdDetails({
      thresProfileId: thresProfileId,
      groupId: 'GOLD',
      payerCount: defaultLimits.payerCount,
      payerAmt: defaultLimits.payerAmt,
      payeeCount: defaultLimits.payeeCount,
      payeeAmt: defaultLimits.payeeAmt,
    });
    console.log('✓ Threshold profile details created');

    const newUser = await userService.createNewUser({
      ...userData,
      password: hashedPassword,
      thresProfileId:thresProfileId,
      txnPin: hashedPin
    });
    console.log('✓ User created:', userData.userId); 

     // 4. Create wallet for the user
    // const walletService = new walletService();
     const wallet = await walletService.createWallet(userData.userId, 'MAIN');
     console.log('✓ Wallet created:', wallet.walletId);



     return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        userId: userData.userId,
        userName: userData.userName,
        userType: userData.userType,
        walletId: wallet.walletId,
        thresProfileId: thresProfileId,
        status: 'ACTIVE',
      },
    
    });

  } catch (err) {
    console.error('Register error:', err);
    
    // Provide more specific error messages
    if (err.message.includes('wallet')) {
      return res.status(500).json({
        message: 'Failed to create wallet',
        error: err.message,
      });
    }
    
    if (err.message.includes('threshold')) {
      return res.status(500).json({
        message: 'Failed to create threshold profile',
        error: err.message,
      });
    }

    return res.status(500).json({
      message: 'Registration failed',
      error: err.message,
    });
  }
}

/**
 * Get default threshold limits based on user type
 */


function getDefaultLimitsByUserType(userType) {
  const limits = {
    USER: {
      payerCount: 10, // 10 transactions per day
      payerAmt: 50000, // ₹500 max per transaction (in paise)
      payeeCount: 20, // 20 receipts per day
      payeeAmt: 100000, // ₹1000 max per receipt (in paise)
    },
    MERCHANT: {
      payerCount: 50,
      payerAmt: 500000, // ₹5000
      payeeCount: 100,
      payeeAmt: 1000000, // ₹10000
    },
    DISTRIBUTOR: {
      payerCount: 200,
      payerAmt: 5000000, // ₹50000
      payeeCount: 500,
      payeeAmt: 10000000, // ₹100000
    },
    ADMIN: {
      payerCount: 1000,
      payerAmt: 10000000, // ₹100000
      payeeCount: 1000,
      payeeAmt: 10000000, // ₹100000
    },
  };

  return limits[userType] || limits.USER;
}
