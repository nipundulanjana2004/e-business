const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, required: true },
  subtitle: { type: String },
  category: { type: String, required: true },
  tags: [{ type: String }],
  price: { type: Number, required: true },
  originalPrice: { type: Number },
  rating: { type: Number, default: 5.0 },
  numReviews: { type: Number, default: 0 },
  isNewArrival: { type: Boolean, default: false },
  isFeatured: { type: Boolean, default: false },
  stock: { type: Number, default: 10 },
  sizes: [{ type: String }],
  colors: [{
    name: String,
    hex: String
  }],
  image: { type: String, required: true },
  additionalImages: [{ type: String }],
  description: { type: String, required: true },
  details: [{ type: String }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
