// src/routes/subscriberRoutes.js

import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams } from '../middlewares/validate.middleware.js';
import * as subscriberController from '../controllers/subscriber/subscriberController.js';
import {
  createSubscriberSchema,
  verifyOtpSchema,
} from '../validators/subscriber.validators.js';

const router = express.Router();

// Public: Register subscriber
router.post(
  '/register',
  validateBody(createSubscriberSchema),
  subscriberController.createSubscriber
);

// Public: Verify OTP
router.post(
  '/verify-otp',
  validateBody(verifyOtpSchema),
  subscriberController.verifyOtp
);

// Public: Get subscriber by MSISDN
router.get(
  '/msisdn/:msisdn',
  subscriberController.getSubscriberByMsisdn
);

// Authenticated: Get subscriber by ID
router.get(
  '/:subscriberId',
  authenticate,
  subscriberController.getSubscriberById
);

// Admin: Get all active subscribers
router.get(
  '/list/active',
  authenticate,
  authorize('ADMIN'),
  subscriberController.getAllActiveSubscribers
);

// Admin: Update subscriber status
router.patch(
  '/:subscriberId/status',
  authenticate,
  authorize('ADMIN'),
  subscriberController.updateSubscriberStatus
);

// Admin: Delete subscriber (soft delete)
router.delete(
  '/:subscriberId',
  authenticate,
  authorize('ADMIN'),
  subscriberController.deleteSubscriber
);

export default router;