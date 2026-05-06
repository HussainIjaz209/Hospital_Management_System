const mongoose = require('mongoose');

const operatingTheaterSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "OT-1 (Cardiac)", "OT-2"
  type: { type: String, enum: ['Major', 'Minor', 'Cardiac', 'Orthopedic', 'General'], default: 'General' },
  floor: { type: String },
  isAvailable: { type: Boolean, default: true },
  lastCleaned: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('OperatingTheater', operatingTheaterSchema);
