// services/serviceTypeService.js
import { db } from '../database/db.js'
import { sysServiceTypes } from '../database/schema/schema.js';
import { eq, and, like } from 'drizzle-orm';

class ServiceTypeService {
  /**
   * Create/Register a new service type
   */
  async createServiceType(serviceData) {
    const {
      serviceType,
      serviceName,
      status = 'A',
      isFinancial = 'N',
    } = serviceData;

    // Check if service type already exists
    const existing = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.serviceType, serviceType))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Service type already exists');
    }

    // Insert new service type
    await db.insert(sysServiceTypes).values({
      sysServiceTypes: serviceType,
      serviceName: serviceName,
      status,
      isFinancial: isFinancial,
    });

    return {
      serviceType,
      serviceName,
      message: 'Service type created successfully',
    };
  }

  /**
   * Get service type by ID
   */
  async getServiceTypeById(serviceType) {
    const result = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.serviceType, serviceType))
      .limit(1);

    if (!result.length) {
      throw new Error('Service type not found');
    }

    return result[0];
  }

  /**
   * Get all service types with filters
   */
  async getAllServiceTypes(filters = {}) {
    const { status, isFinancial, search } = filters;

    let query = db.select().from(sysServiceTypes);

    const conditions = [];

    if (status) {
      conditions.push(eq(sysServiceTypes.status, status));
    }

    if (isFinancial) {
      conditions.push(eq(sysServiceTypes.isFinancial, isFinancial));
    }

    if (search) {
      conditions.push(
        like(sysServiceTypes.serviceName, `%${search}%`)
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const serviceTypes = await query;

    return serviceTypes;
  }

  /**
   * Get only active service types
   */
  async getActiveServiceTypes() {
    const serviceTypes = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.status, 'A'));

    return serviceTypes;
  }

  /**
   * Get financial service types
   */
  async getFinancialServiceTypes() {
    const serviceTypes = await db.select()
      .from(sysServiceTypes)
      .where(
        and(
          eq(sysServiceTypes.status, 'A'),
          eq(sysServiceTypes.isFinancial, 'Y')
        )
      );

    return serviceTypes;
  }

  /**
   * Get non-financial service types
   */
  async getNonFinancialServiceTypes() {
    const serviceTypes = await db.select()
      .from(sysServiceTypes)
      .where(
        and(
          eq(sysServiceTypes.status, 'A'),
          eq(sysServiceTypes.isFinancial, 'N')
        )
      );

    return serviceTypes;
  }

  /**
   * Update service type
   */
  async updateServiceType(serviceType, updateData) {
    // Check if service type exists
    const existing = await this.getServiceTypeById(serviceType);

    if (!existing) {
      throw new Error('Service type not found');
    }

    const allowedUpdates = ['service_name', 'status', 'is_financial'];

    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    await db.update(sysServiceTypes)
      .set(updates)
      .where(eq(sysServiceTypes.serviceType, serviceType));

    return {
      serviceType,
      message: 'Service type updated successfully',
      updates,
    };
  }

  /**
   * Delete/Deactivate service type
   */
  async deleteServiceType(serviceType) {
    // Check if service type exists
    const existing = await this.getServiceTypeById(serviceType);

    if (!existing) {
      throw new Error('Service type not found');
    }

    // Soft delete by setting status to inactive
    await db.update(sysServiceTypes)
      .set({ status: 'I' })
      .where(eq(sysServiceTypes.serviceType, serviceType));

    return {
      serviceType,
      message: 'Service type deactivated successfully',
    };
  }

  /**
   * Activate service type
   */
  async activateServiceType(serviceType) {
    // Check if service type exists
    const existing = await this.getServiceTypeById(serviceType);

    if (!existing) {
      throw new Error('Service type not found');
    }

    await db.update(sysServiceTypes)
      .set({ status: 'A' })
      .where(eq(sysServiceTypes.serviceType, serviceType));

    return {
      serviceType,
      message: 'Service type activated successfully',
    };
  }

  /**
   * Check if service type exists
   */
  async serviceTypeExists(serviceType) {
    const result = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.serviceType, serviceType))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Check if service type is financial
   */
  async isFinancialService(serviceType) {
    const result = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.serviceType, serviceType))
      .limit(1);

    if (!result.length) {
      throw new Error('Service type not found');
    }

    return result[0].is_financial === 'Y';
  }

  /**
   * Bulk create service types
   */
  async bulkCreateServiceTypes(serviceTypesArray) {
    const results = [];
    const errors = [];

    for (const serviceData of serviceTypesArray) {
      try {
        const result = await this.createServiceType(serviceData);
        results.push(result);
      } catch (error) {
        errors.push({
          serviceType: serviceData.serviceType,
          serviceName: serviceData.serviceName,
          error: error.message,
        });
      }
    }

    return {
      success: results.length,
      failed: errors.length,
      results,
      errors,
    };
  }

  /**
   * Get service types grouped by financial status
   */
  async getServiceTypesGrouped() {
    const allServiceTypes = await this.getActiveServiceTypes();

    const financial = allServiceTypes.filter(st => st.isFinancial === 'Y');
    const nonFinancial = allServiceTypes.filter(st => st.isFinancial === 'N');

    return {
      financial,
      nonFinancial,
      total: allServiceTypes.length,
      financialCount: financial.length,
      nonFinancialCount: nonFinancial.length,
    };
  }

  /**
   * Get service type statistics
   */
  async getServiceTypeStats() {
    const allServiceTypes = await db.select().from(sysServiceTypes);

    const active = allServiceTypes.filter(st => st.status === 'A');
    const inactive = allServiceTypes.filter(st => st.status === 'I');
    const financial = allServiceTypes.filter(st => st.isFinancial === 'Y');
    const nonFinancial = allServiceTypes.filter(st => st.isFinancial === 'N');

    return {
      total: allServiceTypes.length,
      active: active.length,
      inactive: inactive.length,
      financial: financial.length,
      nonFinancial: nonFinancial.length,
      activeFinancial: active.filter(st => st.is_financial === 'Y').length,
      activeNonFinancial: active.filter(st => st.is_financial === 'N').length,
    };
  }

  /**
   * Search service types by name
   */
  async searchServiceTypes(searchTerm) {
    const serviceTypes = await db.select()
      .from(sysServiceTypes)
      .where(
        and(
          eq(sysServiceTypes.status, 'A'),
          like(sysServiceTypes.serviceName, `%${searchTerm}%`)
        )
      );

    return serviceTypes;
  }
}

export const serviceTypeService = new ServiceTypeService();