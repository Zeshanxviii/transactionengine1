import express from 'express';
import * as authController from '../controllers/auth/authController.js';
// import { authenticate } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/login", authController.login);
router.post("/register", authController.register);
export default router;