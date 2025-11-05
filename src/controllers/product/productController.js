// controllers/productController.js
import ProductService from '../services/productService.js';

class ProductController {
  async registerSystemProduct(req, res) {
    try {
      const product = await ProductService.registerSystemProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProductById(req, res) {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json(product);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async getAllProducts(req, res) {
    try {
      const filters = req.query;
      const products = await ProductService.getAllProducts(filters);
      res.json(products);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateProduct(req, res) {
    try {
      const updated = await ProductService.updateProduct(req.params.id, req.body);
      res.json(updated);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteProduct(req, res) {
    try {
      const deleted = await ProductService.deleteProduct(req.params.id);
      res.json(deleted);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Product profile endpoints
  async createProductProfile(req, res) {
    try {
      const result = await ProductService.createProductProfile(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getProductProfile(req, res) {
    try {
      const { productId, serviceProvider } = req.params;
      const profile = await ProductService.getProductProfile(productId, serviceProvider);
      res.json(profile);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async updateProductProfile(req, res) {
    try {
      const { productId, serviceProvider } = req.params;
      const result = await ProductService.updateProductProfile(productId, serviceProvider, req.body);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllProductProfiles(req, res) {
    try {
      const filters = req.query;
      const profiles = await ProductService.getAllProductProfiles(filters);
      res.json(profiles);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  // Service type management
  async registerServiceType(req, res) {
    try {
      const result = await ProductService.registerServiceType(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAllServiceTypes(req, res) {
    try {
      const types = await ProductService.getAllServiceTypes();
      res.json(types);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new ProductController();
