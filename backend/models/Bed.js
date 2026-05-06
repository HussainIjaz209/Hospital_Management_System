const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  type: { type: String, enum: ['General', 'ICU', 'Emergency', 'Private'], default: 'General' },
  ward: { type: mongoose.Schema.Types.ObjectId, ref: 'Ward' },
  isOccupied: { type: Boolean, default: false },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  lastCleaned: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Bed', bedSchema);
