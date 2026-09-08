const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').post(createOrder).get(getAllOrders);
router.route('/:id/status').put(protect, adminOnly, updateOrderStatus);

module.exports = router;
