// services/productService.js
import { db } from '../database/db.js';
import { 
  sysProductProfiles, 
  itnProductProfile,
  sysServiceTypes 
} from '../database/schema/schema.js';
import { eq, and, or, like } from 'drizzle-orm';
import { generateId } from '../utils/idGenerator.js';

class ProductService {
  /**
   * Register a new product in system
   */
  async registerSystemProduct(productData) {
    const {
      productType,
      serviceProvider,
      rechargeType,
      productCode,
      api,
      imageUrl,
      status = 'ACTIVE',
    } = productData;

    const productId = generateId('PROD');

    await db.insert(sysProductProfiles).values({
      product_id: productId,
      product_type: productType,
      service_provider: serviceProvider,
      recharge_type: rechargeType,
      product_code: productCode,
      api: api,
      status: status,
      created_on: new Date(),
      image_url: imageUrl,
    });

    return {
      productId,
      message: 'Product registered successfully',
    };
  }

  /**
   * Get product by ID
   */
  async getProductById(productId) {
    const product = await db.select()
      .from(itnProductProfile)
      .where(eq(itnProductProfile.productId, productId))
      .limit(1);

    if (!product.length) {
      throw new Error('Product not found');
    }

    return product[0];
  }

  /**
   * Get all products with filters
   */
  async getAllProducts(filters = {}) {
    const { productType, serviceProvider, status, search, limit = 100 } = filters;

    let query = db.select().from(sysProductProfiles);

    // Build where conditions
    const conditions = [];

    if (productType) {
      conditions.push(eq(sysProductProfiles.productType, productType));
    }

    if (serviceProvider) {
      conditions.push(eq(sysProductProfiles.serviceProvider, serviceProvider));
    }

    if (status) {
      conditions.push(eq(sysProductProfiles.status, status));
    }

    if (search) {
      conditions.push(
        or(
          like(sysProductProfiles.serviceProvider, `%${search}%`),
          like(sysProductProfiles.productCode, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const products = await query.limit(limit);

    return products;
  }

  /**
   * Update product
   */
  async updateProduct(productId, updateData) {
    const product = await this.getProductById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    const allowedUpdates = [
      'product_type',
      'service_provider',
      'recharge_type',
      'product_code',
      'api',
      'status',
      'image_url',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    await db.update(sysProductProfiles)
      .set(updates)
      .where(eq(sysProductProfiles.productId, productId));

    return {
      productId,
      message: 'Product updated successfully',
      updates,
    };
  }

  /**
   * Delete/Deactivate product
   */
  async deleteProduct(productId) {
    const product = await this.getProductById(productId);

    if (!product) {
      throw new Error('Product not found');
    }

    // Soft delete by setting status to INACTIVE
    await db.update(sysProductProfiles)
      .set({ status: 'INACTIVE' })
      .where(eq(sysProductProfiles.productId, productId));

    return {
      productId,
      message: 'Product deactivated successfully',
    };
  }

  /**
   * Create product profile (operator-specific configuration)
   */
  async createProductProfile(profileData) {
    const {
      productId,
      productType,
      serviceProvider,
      rechargeType,
      productCode,
      api,
      marginType,
      margin,
      status = 'A',
    } = profileData;

    // Check if product exists in system
    const systemProduct = await this.getProductById(productId);
    if (!systemProduct) {
      throw new Error('Product not found in system');
    }

    // Check if profile already exists
    const existingProfile = await db.select()
      .from(itnProductProfile)
      .where(
        and(
          eq(itnProductProfile.productId, productId),
          eq(itnProductProfile.serviceProvider, serviceProvider)
        )
      )
      .limit(1);

    if (existingProfile.length > 0) {
      throw new Error('Product profile already exists for this provider');
    }

    await db.insert(itnProductProfile).values({
      productId,
      product_type: productType,
      service_provider: serviceProvider,
      recharge_type: rechargeType,
      product_code: productCode,
      api,
      marginType,
      margin: margin || 0,
      status,
    });

    return {
      productId,
      serviceProvider,
      message: 'Product profile created successfully',
    };
  }

  /**
   * Get product profile
   */
  async getProductProfile(productId, serviceProvider) {
    const profile = await db.select()
      .from(itnProductProfile)
      .where(
        and(
          eq(itnProductProfile.productId, productId),
          eq(itnProductProfile.serviceProvider, serviceProvider)
        )
      )
      .limit(1);

    if (!profile.length) {
      throw new Error('Product profile not found');
    }

    return profile[0];
  }

  /**
   * Update product profile
   */
  async updateProductProfile(productId, serviceProvider, updateData) {
    const profile = await this.getProductProfile(productId, serviceProvider);

    if (!profile) {
      throw new Error('Product profile not found');
    }

    const allowedUpdates = [
      'product_type',
      'recharge_type',
      'product_code',
      'api',
      'marginType',
      'margin',
      'status',
    ];

    const updates = {};
    for (const key of allowedUpdates) {
      if (updateData[key] !== undefined) {
        updates[key] = updateData[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      throw new Error('No valid fields to update');
    }

    await db.update(itnProductProfile)
      .set(updates)
      .where(
        and(
          eq(itnProductProfile.productId, productId),
          eq(itnProductProfile.serviceProvider, serviceProvider)
        )
      );

    return {
      productId,
      serviceProvider,
      message: 'Product profile updated successfully',
      updates,
    };
  }

  /**
   * Get all product profiles
   */
  async getAllProductProfiles(filters = {}) {
    const { productId, productType, serviceProvider, status, limit = 100 } = filters;

    let query = db.select().from(itnProductProfile);

    const conditions = [];

    if (productId) {
      conditions.push(eq(itnProductProfile.productId, productId));
    }

    if (productType) {
      conditions.push(eq(itnProductProfile.productType, productType));
    }

    if (serviceProvider) {
      conditions.push(eq(itnProductProfile.serviceProvider, serviceProvider));
    }

    if (status) {
      conditions.push(eq(itnProductProfile.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const profiles = await query.limit(limit);

    return profiles;
  }

  /**
   * Get products by type (Mobile, DTH, Electricity, etc.)
   */
  async getProductsByType(productType) {
    const products = await db.select()
      .from(sysProductProfiles)
      .where(
        and(
          eq(sysProductProfiles.productType, productType),
          eq(sysProductProfiles.status, 'ACTIVE')
        )
      );

    return products;
  }

  /**
   * Get active service providers for a product type
   */
  async getServiceProviders(productType) {
    const products = await db.select({
      serviceProvider: sysProductProfiles.serviceProvider,
      productType: sysProductProfiles.productType,
    })
      .from(sysProductProfiles)
      .where(
        and(
          eq(sysProductProfiles.productType, productType),
          eq(sysProductProfiles.status, 'ACTIVE')
        )
      );

    // Get unique service providers
    const uniqueProviders = [...new Set(products.map(p => p.serviceProvider))];

    return uniqueProviders;
  }

  /**
   * Register service type
   */
  async registerServiceType(serviceData) {
    const { serviceType, serviceName, status = 'A', isFinancial = 'N' } = serviceData;

    // Check if service type already exists
    const existing = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.serviceType, serviceType))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Service type already exists');
    }

    await db.insert(sysServiceTypes).values({
      service_type: serviceType,
      service_name: serviceName,
      status,
      is_financial: isFinancial,
    });

    return {
      serviceType,
      message: 'Service type registered successfully',
    };
  }

  /**
   * Get all service types
   */
  async getAllServiceTypes() {
    const serviceTypes = await db.select()
      .from(sysServiceTypes)
      .where(eq(sysServiceTypes.status, 'A'));

    return serviceTypes;
  }
}

export const productService = new ProductService();