const express = require('express');
const Product = require('../models/Product');

const router = express.Router();

// GET ALL PRODUCTS
router.get('/', async (req, res) => {
  try {
    const { search, category } = req.query;

    const filter = {};

    if (search) {
      filter.name = {
        $regex: search,
        $options: 'i'
      };
    }

    if (category) {
      filter.category = category;
    }

    const products = await Product.find(filter).sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// GET SINGLE PRODUCT
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch product',
      error: error.message
    });
  }
});

module.exports = router;
