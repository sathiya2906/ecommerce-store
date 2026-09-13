const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const protect = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, async (req, res) => {
  try {
    const { shippingAddress, paymentMethod = 'COD' } = req.body;

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        message: 'Complete shipping address is required'
      });
    }

    if (!['COD', 'Card', 'UPI'].includes(paymentMethod)) {
      return res.status(400).json({
        message: 'Invalid payment method'
      });
    }

    const user = await User.findById(req.user.id).populate('cart.product');

    if (!user) {
      return res.status(404).json({
        message: 'User not found'
      });
    }

    if (!user.cart || user.cart.length === 0) {
      return res.status(400).json({
        message: 'Cart is empty'
      });
    }

    const orderItems = [];
    let totalAmount = 0;

    for (const cartItem of user.cart) {
      const product = cartItem.product;

      if (!product) {
        return res.status(400).json({
          message: 'A product in your cart no longer exists'
        });
      }

      if (cartItem.quantity > product.stock) {
        return res.status(400).json({
          message: `Insufficient stock for ${product.name}`
        });
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        quantity: cartItem.quantity,
        price: product.price
      });

      totalAmount += product.price * cartItem.quantity;
    }

    const order = await Order.create({
      user: user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      status: 'Confirmed'
    });

    for (const cartItem of user.cart) {
      await Product.findByIdAndUpdate(
        cartItem.product._id,
        {
          $inc: { stock: -cartItem.quantity }
        }
      );
    }

    user.cart = [];
    await user.save();

    const createdOrder = await Order.findById(order._id)
      .populate('user', 'name email')
      .populate('items.product');

    res.status(201).json({
      message: 'Order placed successfully',
      order: createdOrder
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to place order',
      error: error.message
    });
  }
});

router.get('/', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch orders',
      error: error.message
    });
  }
});

router.get('/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user.id
    })
      .populate('user', 'name email')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        message: 'Order not found'
      });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to fetch order',
      error: error.message
    });
  }
});

module.exports = router;
