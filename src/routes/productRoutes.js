// routes/product.routes.js
import express from 'express';
import {productService} from '../services/productService.js';
import { authenticate, authorize } from '../middlewares/auth.middleware.js';
import { validateBody, validateParams, validateQuery } from '../middlewares/validate.middleware.js';
import {
  registerProductSchema,
  updateProductSchema,
  getProductsQuerySchema,
  productIdSchema,
  createProductProfileSchema,
  updateProductProfileSchema,
  getProductProfileParamsSchema,
  registerServiceTypeSchema,
} from '../validators/product.validators.js';

const router = express.Router();

// ============================================================
// SYSTEM PRODUCT ROUTES (Admin Only)
// ============================================================

/**
 * Register a new product
 * POST /api/products/register
 */
router.post(
  '/register',
  authenticate,
  authorize('ADMIN'),
  validateBody(registerProductSchema),
  async (req, res) => {
    try {
      const result = await productService.registerSystemProduct(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Product registered successfully',
      });
    } catch (error) {
      console.error('Register product error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register product',
      });
    }
  }
);

/**
 * Get all products with filters
 * GET /api/products?productType=MOBILE&status=ACTIVE
 */
router.get(
  '/',
  authenticate,
  validateQuery(getProductsQuerySchema),
  async (req, res) => {
    try {
      const products = await productService.getAllProducts(req.query);

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get products',
      });
    }
  }
);

/**
 * Get product by ID
 * GET /api/products/:productId
 */
router.get(
  '/:productId',
  authenticate,
  validateParams(productIdSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const product = await productService.getProductById(productId);

      res.json({
        success: true,
        data: product,
      });
    } catch (error) {
      console.error('Get product error:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get product',
      });
    }
  }
);

/**
 * Update product
 * PUT /api/products/:productId
 */
router.put(
  '/:productId',
  authenticate,
  authorize('ADMIN'),
  validateParams(productIdSchema),
  validateBody(updateProductSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await productService.updateProduct(productId, req.body);

      res.json({
        success: true,
        data: result,
        message: 'Product updated successfully',
      });
    } catch (error) {
      console.error('Update product error:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product',
      });
    }
  }
);

/**
 * Delete/Deactivate product
 * DELETE /api/products/:productId
 */
router.delete(
  '/:productId',
  authenticate,
  authorize('ADMIN'),
  validateParams(productIdSchema),
  async (req, res) => {
    try {
      const { productId } = req.params;
      const result = await productService.deleteProduct(productId);

      res.json({
        success: true,
        data: result,
        message: 'Product deactivated successfully',
      });
    } catch (error) {
      console.error('Delete product error:', error);
      
      if (error.message === 'Product not found') {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete product',
      });
    }
  }
);

/**
 * Get products by type
 * GET /api/products/type/:productType
 */
router.get(
  '/type/:productType',
  authenticate,
  async (req, res) => {
    try {
      const { productType } = req.params;
      const products = await productService.getProductsByType(productType);

      res.json({
        success: true,
        data: products,
        count: products.length,
      });
    } catch (error) {
      console.error('Get products by type error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get products',
      });
    }
  }
);

/**
 * Get service providers for a product type
 * GET /api/products/providers/:productType
 */
router.get(
  '/providers/:productType',
  authenticate,
  async (req, res) => {
    try {
      const { productType } = req.params;
      const providers = await productService.getServiceProviders(productType);

      res.json({
        success: true,
        data: providers,
        count: providers.length,
      });
    } catch (error) {
      console.error('Get service providers error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get service providers',
      });
    }
  }
);

// ============================================================
// PRODUCT PROFILE ROUTES (Admin Only)
// ============================================================

/**
 * Create product profile
 * POST /api/products/profile
 */
router.post(
  '/profile/create',
  authenticate,
  authorize('ADMIN'),
  validateBody(createProductProfileSchema),
  async (req, res) => {
    try {
      const result = await productService.createProductProfile(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Product profile created successfully',
      });
    } catch (error) {
      console.error('Create product profile error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create product profile',
      });
    }
  }
);

/**
 * Get product profile
 * GET /api/products/profile/:productId/:serviceProvider
 */
router.get(
  '/profile/:productId/:serviceProvider',
  authenticate,
  async (req, res) => {
    try {
      const { productId, serviceProvider } = req.params;
      const profile = await productService.getProductProfile(
        productId,
        decodeURIComponent(serviceProvider)
      );

      res.json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Get product profile error:', error);
      
      if (error.message === 'Product profile not found') {
        return res.status(404).json({
          success: false,
          message: 'Product profile not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get product profile',
      });
    }
  }
);

/**
 * Update product profile
 * PUT /api/products/profile/:productId/:serviceProvider
 */
router.put(
  '/profile/:productId/:serviceProvider',
  authenticate,
  authorize('ADMIN'),
  validateBody(updateProductProfileSchema),
  async (req, res) => {
    try {
      const { productId, serviceProvider } = req.params;
      const result = await productService.updateProductProfile(
        productId,
        decodeURIComponent(serviceProvider),
        req.body
      );

      res.json({
        success: true,
        data: result,
        message: 'Product profile updated successfully',
      });
    } catch (error) {
      console.error('Update product profile error:', error);
      
      if (error.message === 'Product profile not found') {
        return res.status(404).json({
          success: false,
          message: 'Product profile not found',
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update product profile',
      });
    }
  }
);

/**
 * Get all product profiles
 * GET /api/products/profiles
 */
router.get(
  '/profiles/all',
  authenticate,
  authorize('ADMIN'),
  async (req, res) => {
    try {
      const profiles = await productService.getAllProductProfiles(req.query);

      res.json({
        success: true,
        data: profiles,
        count: profiles.length,
      });
    } catch (error) {
      console.error('Get product profiles error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get product profiles',
      });
    }
  }
);

// ============================================================
// SERVICE TYPE ROUTES (Admin Only)
// ============================================================

/**
 * Register service type
 * POST /api/products/service-type
 */
router.post(
  '/service-type/register',
  authenticate,
  authorize('ADMIN'),
  validateBody(registerServiceTypeSchema),
  async (req, res) => {
    try {
      const result = await productService.registerServiceType(req.body);

      res.status(201).json({
        success: true,
        data: result,
        message: 'Service type registered successfully',
      });
    } catch (error) {
      console.error('Register service type error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register service type',
      });
    }
  }
);

/**
 * Get all service types
 * GET /api/products/service-types
 */
router.get(
  '/service-types/all',
  authenticate,
  async (req, res) => {
    try {
      const serviceTypes = await productService.getAllServiceTypes();

      res.json({
        success: true,
        data: serviceTypes,
        count: serviceTypes.length,
      });
    } catch (error) {
      console.error('Get service types error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get service types',
      });
    }
  }
);

export default router;