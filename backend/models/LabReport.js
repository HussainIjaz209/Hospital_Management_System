const mongoose = require('mongoose');

const labReportSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'LabTest', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }, // Prescribed by
  status: { type: String, enum: ['Pending', 'Processing', 'Completed', 'Cancelled'], default: 'Pending' },
  priority: { type: String, enum: ['Normal', 'Urgent'], default: 'Normal' },
  result: { type: String }, // Summary of result
  numericResults: [{ parameter: String, value: String, unit: String, referenceRange: String }],
  attachmentUrl: { type: String }, // Link to PDF or Image
  labTechnician: { type: String },
  collectedAt: { type: Date },
  completedAt: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('LabReport', labReportSchema);
