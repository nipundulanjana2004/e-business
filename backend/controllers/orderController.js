const { isConnected, memoryStore } = require('../config/db');
const Order = require('../models/Order');
const mongoose = require('mongoose');

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, itemsPrice, shippingPrice, discountPrice, totalPrice, userEmail, userName } = req.body;
    if (!orderItems || orderItems.length === 0) return res.status(400).json({ success: false, message: 'No items in order' });
    const trackingNumber = 'DF-2026-' + Math.floor(100000 + Math.random() * 900000);
    if (isConnected()) {
      const order = new Order({
        user: req.user ? req.user.id : null,
        guestEmail: userEmail || (req.user ? req.user.email : 'guest@dressfeat.com'),
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        itemsPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
        isPaid: paymentMethod !== 'Cash on Delivery',
        paidAt: paymentMethod !== 'Cash on Delivery' ? new Date() : null,
        status: 'Processing',
        trackingNumber
      });
      const createdOrder = await order.save();
      return res.status(201).json({ success: true, order: createdOrder });
    } else {
      const order = {
        _id: 'ord_' + Date.now(),
        id: 'ord_' + Date.now(),
        user: req.user ? { name: req.user.name, email: req.user.email } : { name: userName || shippingAddress.fullName, email: userEmail || 'guest@dressfeat.com' },
        orderItems,
        shippingAddress,
        paymentMethod,
        paymentStatus: paymentMethod === 'Cash on Delivery' ? 'Pending' : 'Paid',
        itemsPrice,
        shippingPrice,
        discountPrice,
        totalPrice,
        isPaid: paymentMethod !== 'Cash on Delivery',
        paidAt: paymentMethod !== 'Cash on Delivery' ? new Date().toISOString() : null,
        status: 'Processing',
        trackingNumber,
        createdAt: new Date().toISOString()
      };
      memoryStore.orders.unshift(order);
      return res.status(201).json({ success: true, order });
    }
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ success: false, message: 'Error processing order' });
  }
};

const getAllOrders = async (req, res) => {
  try {
    if (isConnected()) {
      const orders = await Order.find().sort({ createdAt: -1 });
      return res.json({ success: true, orders });
    } else {
      return res.json({ success: true, orders: memoryStore.orders });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error retrieving orders' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowed = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) return res.status(400).json({ success: false, message: 'Invalid status value' });
    if (isConnected()) {
      if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found (invalid id)' });
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, order });
    } else {
      const order = memoryStore.orders.find(o => o.id === id || o._id === id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      order.status = status;
      return res.json({ success: true, order });
    }
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500).json({ success: false, message: 'Error updating order status: ' + error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    if (isConnected()) {
      if (!mongoose.isValidObjectId(id)) return res.status(404).json({ success: false, message: 'Order not found (invalid id)' });
      const order = await Order.findByIdAndDelete(id);
      if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, message: 'Order deleted' });
    } else {
      const before = memoryStore.orders.length;
      memoryStore.orders = memoryStore.orders.filter(o => o.id !== id && o._id !== id);
      if (memoryStore.orders.length === before) return res.status(404).json({ success: false, message: 'Order not found' });
      return res.json({ success: true, message: 'Order deleted' });
    }
  } catch (error) {
    console.error('Error deleting order:', error);
    res.status(500).json({ success: false, message: 'Error deleting order: ' + error.message });
  }
};

module.exports = { createOrder, getAllOrders, updateOrderStatus, deleteOrder };
