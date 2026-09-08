const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { connectDB, memoryStore } = require('./config/db');

dotenv.config();

const app = express();

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Middlewares (support large images for base64 / file uploads)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(morgan('dev'));

// Serve local static uploaded images
app.use('/uploads', express.static(uploadsDir));

// Connect Database
connectDB();

// API Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/seed', require('./routes/seedRoutes'));

// Direct File Upload endpoint (Base64 or binary)
app.post('/api/upload', (req, res) => {
  try {
    const { imageBase64, fileName } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data provided' });
    }

    // Extract base64 data
    const matches = imageBase64.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    if (matches && matches.length === 3) {
      const extension = matches[1].split('/')[1] || 'jpg';
      const cleanFileName = 'df_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8) + '.' + extension;
      const filePath = path.join(uploadsDir, cleanFileName);
      
      fs.writeFileSync(filePath, Buffer.from(matches[2], 'base64'));
      const fileUrl = `/uploads/${cleanFileName}`;
      return res.json({ success: true, url: fileUrl, message: 'Image uploaded successfully' });
    } else {
      // Direct raw data URL storage fallback
      return res.json({ success: true, url: imageBase64, message: 'Image saved as data source' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Error processing file upload' });
  }
});

app.get('/api/reviews', (req, res) => {
  res.json({ success: true, reviews: memoryStore.reviews });
});

app.post('/api/contact', (req, res) => {
  const { name, email, subject, message } = req.body;
  res.json({ success: true, message: 'Thank you for contacting DRESSFEAT Atelier.' });
});

app.post('/api/newsletter', (req, res) => {
  const { email } = req.body;
  res.json({ success: true, message: 'Welcome to DRESSFEAT Atelier. Use voucher code FEAT2026 for 15% off.' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', atelier: 'DRESSFEAT 2026', timestamp: new Date().toISOString() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 DRESSFEAT Backend Server running on http://localhost:${PORT}`);
});
