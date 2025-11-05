// src/routes/thresholdRoutes.js

import express from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody, validateQuery, validateParams } from '../middlewares/validate.middleware.js';
import * as thresholdController from '../controllers/threshold/thresholdController.js';
// import {
//   createThresholdProfileSchema,
//   createThresholdDetailsSchema,
//   validateThresholdSchema,
//   getUserLimitsSchema,
// } from '../validators/threshold.validators.js';
import { createThresholdProfileSchema,
          createThresholdDetailsSchema,
          validateThresholdSchema,
          getUserLimitsSchema
 } from '../validators/threshold.validator.js'

const router = express.Router();

// Admin: Create threshold profile
router.post(
  '/profiles',
  authenticate,
  authorize('ADMIN'),
  validateBody(createThresholdProfileSchema),
  thresholdController.createThresholdProfile
);

// Admin: Create threshold details (Daily, Weekly, Monthly limits)
router.post(
  '/details',
  authenticate,
  authorize('ADMIN'),
  validateBody(createThresholdDetailsSchema),
  thresholdController.createThresholdDetails
);

// Validate transaction against thresholds
router.post(
  '/validate',
  authenticate,
  validateBody(validateThresholdSchema),
  thresholdController.validateThreshold
);

// Get user's remaining limits
router.get(
  '/limits/me',
  authenticate,
  validateQuery(getUserLimitsSchema),
  thresholdController.getUserRemainingLimits
);

export default router;