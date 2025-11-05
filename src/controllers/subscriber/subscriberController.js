// src/controllers/subscriber/subscriberController.js

import { subscriberService } from '../../services/subscriberService.js';
import {
  createSubscriberSchema,
  verifyOtpSchema,
  updateSubscriberSchema,
} from '../../validators/subscriber.validators.js';

export const createSubscriber = async (req, res) => {
  try {
    const validationResult = createSubscriberSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues,
      });
    }

    const result = await subscriberService.createSubscriber(validationResult.data);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Subscriber created successfully',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubscriberById = async (req, res) => {
  try {
    const { subscriberId } = req.params;
    
    const subscriber = await subscriberService.getSubscriberById(subscriberId);
    
    res.json({
      success: true,
      data: subscriber,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

export const getSubscriberByMsisdn = async (req, res) => {
  try {
    const { msisdn } = req.params;
    
    const subscriber = await subscriberService.getSubscriberByMsisdn(msisdn);
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found',
      });
    }
    
    res.json({
      success: true,
      data: subscriber,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const validationResult = verifyOtpSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.issues,
      });
    }

    const result = await subscriberService.verifyOtp(
      validationResult.data.subscriberId,
      validationResult.data.otp
    );
    
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const updateSubscriberStatus = async (req, res) => {
  try {
    const { subscriberId } = req.params;
    const { status } = req.body;

    if (!['Active', 'Inactive', 'Suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Use: Active, Inactive, or Suspended',
      });
    }

    const result = await subscriberService.updateSubscriberStatus(subscriberId, status);
    
    res.json({
      success: true,
      data: result,
      message: 'Subscriber status updated',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const deleteSubscriber = async (req, res) => {
  try {
    const { subscriberId } = req.params;
    
    const result = await subscriberService.deleteSubscriber(subscriberId);
    
    res.json({
      success: true,
      data: result,
      message: 'Subscriber deleted',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllActiveSubscribers = async (req, res) => {
  try {
    const { limit } = req.query;
    
    const subscribers = await subscriberService.getAllActiveSubscribers(
      limit ? parseInt(limit) : 100
    );
    
    res.json({
      success: true,
      data: subscribers,
      count: subscribers.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};