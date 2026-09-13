const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const products = [
  {
    name: 'Wireless Headphones',
    description: 'Premium wireless headphones with clear sound and comfortable design.',
    price: 2499,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e',
    stock: 25,
    rating: 4.5
  },
  {
    name: 'Smart Watch',
    description: 'Modern smartwatch with fitness tracking and daily activity monitoring.',
    price: 3999,
    category: 'Electronics',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    stock: 18,
    rating: 4.3
  },
  {
    name: 'Running Shoes',
    description: 'Lightweight running shoes designed for comfort and everyday workouts.',
    price: 2999,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff',
    stock: 30,
    rating: 4.4
  },
  {
    name: 'Classic Backpack',
    description: 'Spacious and stylish backpack suitable for college, work and travel.',
    price: 1499,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62',
    stock: 20,
    rating: 4.2
  },
  {
    name: 'Cotton T-Shirt',
    description: 'Comfortable premium cotton t-shirt with a clean modern style.',
    price: 799,
    category: 'Fashion',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    stock: 40,
    rating: 4.1
  },
  {
    name: 'Laptop Stand',
    description: 'Adjustable laptop stand for comfortable working and better desk setup.',
    price: 1299,
    category: 'Accessories',
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46',
    stock: 15,
    rating: 4.6
  }
];

const seedProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log('MongoDB connected');

    await Product.deleteMany();

    await Product.insertMany(products);

    console.log(`${products.length} products added successfully`);

    await mongoose.connection.close();

    console.log('Database connection closed');
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exit(1);
  }
};

seedProducts();
