const express = require('express');
const router = express.Router();
const { isConnected, memoryStore } = require('../config/db');
const Product = require('../models/Product');
const productsData = require('../data/productsData');

router.post('/reset', async (req, res) => {
  try {
    if (isConnected()) {
      await Product.deleteMany({});
      await Product.insertMany(productsData);
      return res.json({ success: true, message: 'Database reset and seeded with initial catalog.' });
    } else {
      memoryStore.products = [...productsData];
      return res.json({ success: true, message: 'In-memory database refreshed with initial catalog.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error resetting data' });
  }
});

module.exports = router;
