const crypto = require('crypto');
const { isConnected, memoryStore } = require('../config/db');
const Order = require('../models/Order');

const md5 = (str) => crypto.createHash('md5').update(str).digest('hex');

/**
 * Generate PayHere Hash for payment initiation
 * POST /api/payhere/hash
 */
const generatePayHereHash = (req, res) => {
  try {
    const { order_id, amount, currency = 'LKR' } = req.body;

    if (!order_id || amount === undefined || amount === null) {
      return res.status(400).json({
        success: false,
        message: 'order_id and amount are required'
      });
    }

    const merchantId = process.env.PAYHERE_MERCHANT_ID || '1238333';
    const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
    const isSandbox = process.env.PAYHERE_SANDBOX !== 'false';

    if (!merchantSecret) {
      console.error('❌ [PayHere Error] PAYHERE_SECRET is not configured in backend/.env');
      return res.status(500).json({
        success: false,
        message: 'Backend server configuration error: PAYHERE_SECRET missing'
      });
    }

    // 1. Format amount strictly to 2 decimal places without commas
    const amountFormatted = Number(amount).toFixed(2);

    // 2. Hash the merchant secret and convert to uppercase
    const hashedSecret = md5(merchantSecret).toUpperCase();

    // 3. Concatenate merchant_id + order_id + amount_formatted + currency + hashedSecret
    const rawString = merchantId + order_id + amountFormatted + currency + hashedSecret;

    // 4. Calculate final MD5 hash and convert to uppercase
    const hash = md5(rawString).toUpperCase();

    // Dev Console Logging (NEVER log the merchant secret itself)
    console.log('💳 [PayHere Backend Hash Generated]', {
      order_id,
      amount: amountFormatted,
      currency,
      merchant_id: merchantId,
      sandbox_mode: isSandbox,
      hash_preview: hash.substring(0, 8) + '...' + hash.substring(hash.length - 4),
      timestamp: new Date().toISOString()
    });

    return res.json({
      success: true,
      hash,
      merchant_id: merchantId,
      sandbox: isSandbox,
      amount: amountFormatted,
      currency
    });
  } catch (error) {
    console.error('❌ [PayHere Backend Error]', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate PayHere payment hash'
    });
  }
};

/**
 * Handle PayHere IPN / Server-to-Server Callback Notification
 * POST /api/payhere/notify
 */
const handlePayHereNotify = async (req, res) => {
  try {
    const {
      merchant_id,
      order_id,
      payment_id,
      payhere_amount,
      payhere_currency,
      status_code,
      md5sig,
      custom_1,
      custom_2
    } = req.body;

    const merchantSecret = (process.env.PAYHERE_SECRET || '').trim();
    const hashedSecret = md5(merchantSecret).toUpperCase();
    const localMd5sig = md5(
      merchant_id +
      order_id +
      payhere_amount +
      payhere_currency +
      status_code +
      hashedSecret
    ).toUpperCase();

    console.log('🔔 [PayHere IPN Received]', {
      order_id,
      payment_id,
      status_code,
      payhere_amount,
      payhere_currency,
      signature_valid: md5sig === localMd5sig
    });

    if (md5sig !== localMd5sig) {
      console.warn('⚠️ [PayHere IPN] Invalid signature received!');
      return res.status(400).send('Invalid Signature');
    }

    // status_code: 2 = Success, 0 = Pending, -1 = Canceled, -2 = Failed, -3 = Chargedback
    if (status_code === '2' || status_code === 2) {
      console.log(`✅ [PayHere Order ${order_id}] Payment Verified & Completed.`);
      
      // Update order status in DB or MemoryStore
      if (isConnected()) {
        await Order.findOneAndUpdate(
          { trackingNumber: order_id },
          { paymentStatus: 'Paid', isPaid: true, paidAt: new Date(), status: 'Processing' }
        );
      } else {
        const order = memoryStore.orders.find(o => o.trackingNumber === order_id || o.id === order_id || o._id === order_id);
        if (order) {
          order.paymentStatus = 'Paid';
          order.isPaid = true;
          order.paidAt = new Date().toISOString();
        }
      }
    }

    return res.status(200).send('OK');
  } catch (error) {
    console.error('❌ [PayHere IPN Error]', error);
    return res.status(500).send('Server Error');
  }
};

/**
 * Get Public PayHere Config (non-sensitive)
 * GET /api/payhere/config
 */
const getPayHereConfig = (req, res) => {
  const merchantId = process.env.PAYHERE_MERCHANT_ID || '1238333';
  const isSandbox = process.env.PAYHERE_SANDBOX !== 'false';
  return res.json({
    success: true,
    merchant_id: merchantId,
    sandbox: isSandbox
  });
};

module.exports = {
  generatePayHereHash,
  handlePayHereNotify,
  getPayHereConfig
};
