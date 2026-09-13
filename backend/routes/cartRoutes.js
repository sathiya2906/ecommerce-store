const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

// GET CART
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('cart.product');

    res.json(user.cart);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch cart',
      error: error.message
    });
  }
});

// ADD TO CART
router.post('/', protect, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: 'Requested quantity exceeds available stock'
      });
    }

    const user = await User.findById(req.user.id);

    const existingItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const newQuantity = existingItem.quantity + quantity;

      if (newQuantity > product.stock) {
        return res.status(400).json({
          message: 'Requested quantity exceeds available stock'
        });
      }

      existingItem.quantity = newQuantity;
    } else {
      user.cart.push({
        product: productId,
        quantity
      });
    }

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      message: 'Product added to cart',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add product to cart',
      error: error.message
    });
  }
});

// UPDATE CART QUANTITY
router.put('/:productId', protect, async (req, res) => {
  try {
    const { quantity } = req.body;
    const { productId } = req.params;

    if (!quantity || quantity < 1) {
      return res.status(400).json({
        message: 'Quantity must be at least 1'
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        message: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        message: 'Requested quantity exceeds available stock'
      });
    }

    const user = await User.findById(req.user.id);

    const cartItem = user.cart.find(
      (item) => item.product.toString() === productId
    );

    if (!cartItem) {
      return res.status(404).json({
        message: 'Product not found in cart'
      });
    }

    cartItem.quantity = quantity;

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      message: 'Cart quantity updated',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update cart',
      error: error.message
    });
  }
});

// REMOVE PRODUCT FROM CART
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const user = await User.findById(req.user.id);

    user.cart = user.cart.filter(
      (item) => item.product.toString() !== productId
    );

    await user.save();

    const updatedUser = await User.findById(req.user.id).populate('cart.product');

    res.json({
      message: 'Product removed from cart',
      cart: updatedUser.cart
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to remove product',
      error: error.message
    });
  }
});

// CLEAR CART
router.delete('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    user.cart = [];

    await user.save();

    res.json({
      message: 'Cart cleared successfully',
      cart: []
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to clear cart',
      error: error.message
    });
  }
});

module.exports = router;
