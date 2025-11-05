// src/services/subscriberService.js

import { eq } from 'drizzle-orm';
import { db } from '../database/db.js';
import { itnSubscribers } from '../database/schema/schema.js';
import { generateId } from '../utils/idGenerator.js';

export class SubscriberService {
  // Create subscriber
  async createSubscriber(data) {
    try {
      const subscriberId = generateId('SUB');
      
      await db.insert(itnSubscribers).values({
        subscriberId,
        firstName: data.firstName,
        lastName: data.lastName,
        emailId: data.emailId,
        msisdn: data.msisdn,
        status: 'Active',
        createdOn: new Date(),
      });

      return { subscriberId, message: 'Subscriber created successfully' };
    } catch (error) {
      throw new Error(`Failed to create subscriber: ${error.message}`);
    }
  }

  // Get subscriber by ID
  async getSubscriberById(subscriberId) {
    try {
      const subscriber = await db.select()
        .from(itnSubscribers)
        .where(eq(itnSubscribers.subscriberId, subscriberId))
        .limit(1);

      if (!subscriber.length) {
        throw new Error('Subscriber not found');
      }

      return subscriber[0];
    } catch (error) {
      throw new Error(`Failed to get subscriber: ${error.message}`);
    }
  }

  // Get subscriber by MSISDN
  async getSubscriberByMsisdn(msisdn) {
    try {
      const subscriber = await db.select()
        .from(itnSubscribers)
        .where(eq(itnSubscribers.msisdn, msisdn))
        .limit(1);

      if (!subscriber.length) {
        return null;
      }

      return subscriber[0];
    } catch (error) {
      throw new Error(`Failed to get subscriber: ${error.message}`);
    }
  }

  // Update subscriber status
  async updateSubscriberStatus(subscriberId, status) {
    try {
      return await db.update(itnSubscribers)
        .set({ status })
        .where(eq(itnSubscribers.subscriberId, subscriberId));
    } catch (error) {
      throw new Error(`Failed to update subscriber: ${error.message}`);
    }
  }

  // Verify OTP
  async verifyOtp(subscriberId, otp) {
    try {
      const subscriber = await this.getSubscriberById(subscriberId);

      if (subscriber.otp !== otp) {
        throw new Error('Invalid OTP');
      }

      // Clear OTP after verification
      await db.update(itnSubscribers)
        .set({ otp: null, status: 'Active' })
        .where(eq(itnSubscribers.subscriberId, subscriberId));

      return { message: 'OTP verified successfully' };
    } catch (error) {
      throw new Error(`OTP verification failed: ${error.message}`);
    }
  }

  // Delete subscriber (soft delete)
  async deleteSubscriber(subscriberId) {
    try {
      return await db.update(itnSubscribers)
        .set({ 
          status: 'Inactive',
          deletedOn: new Date() 
        })
        .where(eq(itnSubscribers.subscriberId, subscriberId));
    } catch (error) {
      throw new Error(`Failed to delete subscriber: ${error.message}`);
    }
  }

  // Get all active subscribers
  async getAllActiveSubscribers(limit = 100) {
    try {
      return await db.select()
        .from(itnSubscribers)
        .where(eq(itnSubscribers.status, 'Active'))
        .limit(limit);
    } catch (error) {
      throw new Error(`Failed to get subscribers: ${error.message}`);
    }
  }
}

export const subscriberService = new SubscriberService();