const mongoose = require('mongoose');

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  category: { type: String, enum: ['Tablet', 'Capsule', 'Syrup', 'Injection', 'Ointment', 'Other'], default: 'Tablet' },
  stock: { type: Number, required: true, default: 0 },
  minStockLevel: { type: Number, default: 10 }, // Threshold for "Low Stock"
  price: { type: Number, required: true },
  expiryDate: { type: Date },
  manufacturer: { type: String },
  location: { type: String }, // e.g. "Shelf A-1"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
