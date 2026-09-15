const mongoose = require('mongoose');

let isConnected = false;
let isInMemory = false;

const memoryStore = {
  products: [...require('../data/productsData')],
  users: [
    {
      _id: 'usr_admin',
      id: 'usr_admin',
      name: 'Dressfeat Atelier Admin',
      email: 'admin@dressfeat.com',
      password: 'DressFeat@Admin2026',
      role: 'admin',
      createdAt: new Date().toISOString()
    },
    {
      _id: 'usr_demo',
      id: 'usr_demo',
      name: 'Sophia Laurent',
      email: 'sophia@example.com',
      password: 'password123',
      role: 'customer',
      createdAt: new Date().toISOString()
    }
  ],
  orders: [
    {
      _id: 'ord_1001',
      id: 'ord_1001',
      user: { name: 'Sophia Laurent', email: 'sophia@example.com' },
      orderItems: [
        {
          product: 'prod_1',
          name: 'Silk Utility Shirt',
          price: 2000,
          qty: 1,
          size: 'M',
          color: 'Champagne Beige',
          image: 'https://images.unsplash.com/photo-1598554747436-c9293d6a588f?auto=format&fit=crop&w=800&q=80'
        }
      ],
      shippingAddress: {
        fullName: 'Sophia Laurent',
        address: '45 Avenue Montaigne',
        city: 'Paris',
        postalCode: '75008',
        country: 'France',
        phone: '+33 1 42 68 55 00'
      },
      paymentMethod: 'Credit Card',
      paymentStatus: 'Paid',
      itemsPrice: 2000,
      shippingPrice: 0,
      discountPrice: 0,
      totalPrice: 2000,
      isPaid: true,
      paidAt: new Date().toISOString(),
      status: 'Processing',
      trackingNumber: 'DF-FR-889210',
      createdAt: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  reviews: [...require('../data/reviewsData')]
};

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/dressfeat';
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2000
    });
    isConnected = true;
    console.log('✅ MongoDB Connected: ' + conn.connection.host);
    // Ensure admin user exists with updated password
    try {
      const User = require('../models/User');
      await User.findOneAndUpdate(
        { email: 'admin@dressfeat.com' },
        { 
          name: 'Dressfeat Atelier Admin',
          email: 'admin@dressfeat.com',
          password: 'DressFeat@Admin2026',
          role: 'admin'
        },
        { upsert: true, new: true }
      );
    } catch (e) {
      console.log('Admin sync notice:', e.message);
    }

    // Auto-seed if database is empty
    const Product = require('../models/Product');
    const User = require('../models/User');
    const productsData = require('../data/productsData');

    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('📦 Auto-seeding initial products catalog...');
      await Product.insertMany(productsData);
      console.log('✅ Products catalog seeded successfully.');
    }

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.insertMany([
        {
          name: 'Dressfeat Atelier Admin',
          email: 'admin@dressfeat.com',
          password: 'DressFeat@Admin2026',
          role: 'admin'
        },
        {
          name: 'Sophia Laurent',
          email: 'sophia@example.com',
          password: 'password123',
          role: 'customer'
        }
      ]);
      console.log('✅ Demo accounts seeded successfully.');
    }
  } catch (error) {
    isInMemory = true;
    console.log('⚡ Operating with embedded in-memory database store.');
  }
};

module.exports = {
  connectDB,
  isConnected: () => isConnected,
  isInMemory: () => isInMemory,
  memoryStore
};
