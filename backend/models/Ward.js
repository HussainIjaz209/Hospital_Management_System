const mongoose = require('mongoose');

const wardSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g. "Ward 101", "ICU-A"
  type: { type: String, enum: ['ICU', 'General', 'Private', 'Emergency', 'Pediatric'], required: true },
  floor: { type: String },
  capacity: { type: Number, required: true },
  assignedNurse: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Reference to Nurse
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Ward', wardSchema);
