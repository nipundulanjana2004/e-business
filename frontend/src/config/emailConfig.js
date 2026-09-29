// EmailJS Configuration
// Sign up free at https://www.emailjs.com
// 1. Connect your Gmail service -> copy the Service ID below
// 2. Copy your Public Key from Account -> API Keys
// Set EMAIL_ENABLED = true once you have filled in real credentials

export const EMAIL_CONFIG = {
  SERVICE_ID:  'YOUR_SERVICE_ID',
  PUBLIC_KEY:  'YOUR_PUBLIC_KEY',
  TEMPLATES: {
    WELCOME: 'template_welcome',
    ORDER:   'template_order',
    STATUS:  'template_status',
  }
};

export const EMAIL_ENABLED = false;
