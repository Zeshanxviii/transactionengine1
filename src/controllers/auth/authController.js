import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import * as userService from '../../services/userService.js';
import { loginSchema } from '../../validators/auth.validator.js';
import { createUserSchema } from '../../validators/auth.validator.js';


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

    const [user] = await userService.getUserById(userId);

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
    // Check if user already exists
    const [existingUser] = await userService.getUserById(userData.userId);
    console.log(existingUser);
    if (existingUser) {
      return res.status(409).json({ message: "User ID already taken" });
    }

    const saltRounds = Number(process.env.SALT) || 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = await userService.createNewUser({
      ...userData,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "User registered successfully",
      userId: userData,
    });

  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
