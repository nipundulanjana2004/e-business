const { isConnected, memoryStore } = require('../config/db');
const Product = require('../models/Product');
const mongoose = require('mongoose');

const getProducts = async (req, res) => {
  try {
    const { category, search, sort, isNewArrival, minPrice, maxPrice } = req.query;
    if (isConnected()) {
      let query = {};
      if (category && category !== 'all') query.category = category;
      if (isNewArrival === 'true') query.isNewArrival = true;
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { subtitle: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = Number(minPrice);
        if (maxPrice) query.price.$lte = Number(maxPrice);
      }
      let sortOptions = {};
      if (sort === 'price-asc') sortOptions.price = 1;
      else if (sort === 'price-desc') sortOptions.price = -1;
      else if (sort === 'rating') sortOptions.rating = -1;
      else sortOptions.createdAt = -1;
      const products = await Product.find(query).sort(sortOptions);
      return res.json({ success: true, count: products.length, products });
    } else {
      let products = [...memoryStore.products];
      if (category && category !== 'all') {
        products = products.filter(p => p.category === category || (p.tags && p.tags.includes(category)));
      }
      if (isNewArrival === 'true') {
        products = products.filter(p => p.isNewArrival === true || (p.tags && p.tags.includes('new-arrivals')));
      }
      if (search) {
        const s = search.toLowerCase();
        products = products.filter(p => 
          p.name.toLowerCase().includes(s) || 
          (p.subtitle && p.subtitle.toLowerCase().includes(s)) ||
          (p.description && p.description.toLowerCase().includes(s))
        );
      }
      if (minPrice) products = products.filter(p => p.price >= Number(minPrice));
      if (maxPrice) products = products.filter(p => p.price <= Number(maxPrice));
      if (sort === 'price-asc') products.sort((a, b) => a.price - b.price);
      else if (sort === 'price-desc') products.sort((a, b) => b.price - a.price);
      else if (sort === 'rating') products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      return res.json({ success: true, count: products.length, products });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error retrieving products' });
  }
};

const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      let product = null;
      if (mongoose.isValidObjectId(id)) {
        product = await Product.findById(id);
      }
      if (!product) {
        product = await Product.findOne({ $or: [{ id }, { name: new RegExp('^' + id + '$', 'i') }] });
      }
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    } else {
      const product = memoryStore.products.find(p => p.id === id || p._id === id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      return res.json({ success: true, product });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving product' });
  }
};

const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    if (isConnected()) {
      const newProduct = new Product(productData);
      await newProduct.save();
      return res.status(201).json({ success: true, product: newProduct });
    } else {
      const newProduct = {
        id: 'prod_' + Date.now(),
        _id: 'prod_' + Date.now(),
        ...productData,
        createdAt: new Date().toISOString()
      };
      memoryStore.products.unshift(newProduct);
      return res.status(201).json({ success: true, product: newProduct });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating product' });
  }
};

const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true });
      return res.json({ success: true, product: updated });
    } else {
      const index = memoryStore.products.findIndex(p => p.id === id || p._id === id);
      if (index === -1) return res.status(404).json({ success: false, message: 'Product not found' });
      memoryStore.products[index] = { ...memoryStore.products[index], ...req.body };
      return res.json({ success: true, product: memoryStore.products[index] });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating product' });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      await Product.findByIdAndDelete(id);
      return res.json({ success: true, message: 'Product deleted' });
    } else {
      memoryStore.products = memoryStore.products.filter(p => p.id !== id && p._id !== id);
      return res.json({ success: true, message: 'Product deleted' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting product' });
  }
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
