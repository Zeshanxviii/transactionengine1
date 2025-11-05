// src/controllers/threshold/thresholdController.js

import { thresholdService } from '../../services/thresholdService.js';
import {
  createThresholdProfileSchema,
  createThresholdDetailsSchema,
  validateThresholdSchema,
  getUserLimitsSchema,
} from '../../validators/threshold.validator.js';

export const createThresholdProfile = async (req, res) => {
  try {
    const validationResult = createThresholdProfileSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues,
      });
    }

    const result = await thresholdService.createThresholdProfile(validationResult.data);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Threshold profile created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const createThresholdDetails = async (req, res) => {
  try {
    const validationResult = createThresholdDetailsSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues,
      });
    }

    const result = await thresholdService.createThresholdDetails(validationResult.data);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Threshold details created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const validateThreshold = async (req, res) => {
  try {
    const validationResult = validateThresholdSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues,
      });
    }

    const result = await thresholdService.validateAllThresholds(
      validationResult.data.userId,
      validationResult.data.amount,
      validationResult.data.role,
      validationResult.data.groupId
    );

    res.json({
      success: result.valid,
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getUserRemainingLimits = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { role, groupId } = req.query;

    const limits = await thresholdService.getUserRemainingLimits(
      userId,
      role || 'PAYER',
      groupId || 'DEFAULT'
    );

    res.json({
      success: true,
      data: limits,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};