const express = require('express');
const router = express.Router();
const { createOrder, getAllOrders, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');

router.route('/').post(createOrder).get(getAllOrders);
router.route('/:id/status').put(protect, adminOnly, updateOrderStatus);
router.route('/:id').delete(protect, adminOnly, deleteOrder);

module.exports = router;
