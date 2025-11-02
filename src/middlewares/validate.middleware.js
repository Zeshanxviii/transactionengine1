// middleware/validate.middleware.js
import { z } from 'zod';

/**
 * Core validation function
 * @param {z.ZodSchema} schema - Zod schema to validate against
 * @param {string} source - Where to get data from: 'body', 'query', 'params'
 * @returns {Function} Express middleware function
 */
const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      // Get data from the specified source
      const dataToValidate = req[source];

      // Validate the data using Zod
      const validatedData = schema.parse(dataToValidate);

      // Replace the original data with validated data
      req[source] = validatedData;

      // Optionally, store validated data in a separate property
      req.validated = req.validated || {};
      req.validated[source] = validatedData;

      // Continue to next middleware/route handler
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof z.ZodError) {
        // Format Zod errors into a clean structure
        const formattedErrors = error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
          code: err.code,
        }));

        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: formattedErrors,
        });
      }

      // Handle other unexpected errors
      console.error('Validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
  };
};

/**
 * Validate request body (POST/PUT/PATCH data)
 * @param {z.ZodSchema} schema - Zod schema for body validation
 * @returns {Function} Express middleware
 * 
 * @example
 * router.post('/user', validateBody(userSchema), (req, res) => {
 *   // req.body is now validated
 * });
 */
export const validateBody = (schema) => {
  return validate(schema, 'body');
};

/**
 * Validate query parameters (URL query strings like ?limit=10&page=1)
 * @param {z.ZodSchema} schema - Zod schema for query validation
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/users', validateQuery(paginationSchema), (req, res) => {
 *   // req.query is now validated
 * });
 */
export const validateQuery = (schema) => {
  return validate(schema, 'query');
};

/**
 * Validate route parameters (URL params like /user/:id)
 * @param {z.ZodSchema} schema - Zod schema for params validation
 * @returns {Function} Express middleware
 * 
 * @example
 * router.get('/user/:id', validateParams(idSchema), (req, res) => {
 *   // req.params is now validated
 * });
 */
export const validateParams = (schema) => {
  return validate(schema, 'params');
};

/**
 * Validate multiple sources at once (body + query + params)
 * @param {Object} schemas - Object with schemas for different sources
 * @returns {Function} Express middleware
 * 
 * @example
 * router.put('/user/:id', validateMultiple({
 *   params: idSchema,
 *   body: updateUserSchema
 * }), (req, res) => {
 *   // Both req.params and req.body are validated
 * });
 */
export const validateMultiple = (schemas) => {
  return (req, res, next) => {
    try {
      req.validated = {};
      const errors = [];

      // Validate each source
      for (const [source, schema] of Object.entries(schemas)) {
        if (schema && req[source]) {
          try {
            const validatedData = schema.parse(req[source]);
            req[source] = validatedData;
            req.validated[source] = validatedData;
          } catch (error) {
            if (error instanceof z.ZodError) {
              error.errors.forEach(err => {
                errors.push({
                  source: source,
                  field: err.path.join('.'),
                  message: err.message,
                  code: err.code,
                });
              });
            }
          }
        }
      }

      // If there are validation errors, return them
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors,
        });
      }

      next();
    } catch (error) {
      console.error('Multiple validation error:', error);
      return res.status(500).json({
        success: false,
        message: 'Validation error',
        error: error.message,
      });
    }
  };
};

/**
 * Optional validation - doesn't fail if data is invalid, just logs warning
 * Useful for backward compatibility or non-critical validations
 * @param {z.ZodSchema} schema - Zod schema
 * @param {string} source - Data source
 * @returns {Function} Express middleware
 */
export const validateOptional = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = req[source];
      const validatedData = schema.parse(dataToValidate);
      req[source] = validatedData;
      req.validated = req.validated || {};
      req.validated[source] = validatedData;
    } catch (error) {
      // Just log the error but don't stop the request
      console.warn(`Optional validation failed for ${source}:`, error.message);
    }
    next();
  };
};

// Export everything
export default {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  validateMultiple,
  validateOptional,
};