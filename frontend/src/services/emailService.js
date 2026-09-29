import emailjs from '@emailjs/browser';
import { EMAIL_CONFIG, EMAIL_ENABLED } from '../config/emailConfig';

let _init = false;
function ensureInit() {
  if (!_init && EMAIL_ENABLED) {
    emailjs.init(EMAIL_CONFIG.PUBLIC_KEY);
    _init = true;
  }
}

async function safeSend(templateId, params) {
  if (!EMAIL_ENABLED) { console.log('[Email skipped]', params); return; }
  try {
    ensureInit();
    await emailjs.send(EMAIL_CONFIG.SERVICE_ID, templateId, params);
  } catch (err) {
    console.warn('[EmailService] send failed:', err);
  }
}

export async function sendWelcomeEmail(user) {
  await safeSend(EMAIL_CONFIG.TEMPLATES.WELCOME, {
    to_name: user.name, to_email: user.email, brand: 'DRESSFEAT Atelier',
    message: 'Welcome to DRESSFEAT Atelier! Your account has been created.',
  });
}

export async function sendOrderConfirmEmail(user, order) {
  const items = (order.orderItems || []).map(i => i.name + ' x' + i.qty + ' - Rs.' + i.price).join('\n');
  await safeSend(EMAIL_CONFIG.TEMPLATES.ORDER, {
    to_name: user.name, to_email: user.email, brand: 'DRESSFEAT Atelier',
    order_id: order._id || order.id || 'N/A', items, total: 'Rs.' + (order.totalPrice || ''),
    message: 'Thank you for your order! We are preparing it for dispatch.',
  });
}

export async function sendOrderStatusEmail(userEmail, userName, order, status) {
  const msgs = {
    Shipped:   'Your order has been shipped and is on its way!',
    Delivered: 'Your order has been delivered. Enjoy your DRESSFEAT pieces!',
    Cancelled: 'Your order has been cancelled. Contact us for any queries.',
  };
  await safeSend(EMAIL_CONFIG.TEMPLATES.STATUS, {
    to_name: userName, to_email: userEmail, brand: 'DRESSFEAT Atelier',
    order_id: order._id || order.id || 'N/A', status,
    message: msgs[status] || ('Order status updated to: ' + status),
  });
}
