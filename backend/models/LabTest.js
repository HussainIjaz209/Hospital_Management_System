const mongoose = require('mongoose');

const labTestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['Blood Work', 'Imaging', 'Pathology', 'Cardiology', 'Neurology', 'Other'], default: 'Other' },
  price: { type: Number, required: true },
  description: { type: String },
  tat: { type: String }, // Turnaround Time, e.g., "24 Hours"
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('LabTest', labTestSchema);
