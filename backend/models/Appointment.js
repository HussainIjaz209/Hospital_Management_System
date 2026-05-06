const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  date: { type: Date, required: true },
  reason: { type: String },
  status: { type: String, enum: ['Scheduled', 'In-Consultation', 'Completed', 'Cancelled'], default: 'Scheduled' },
  isEmergency: { type: Boolean, default: false },
  tokenNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Appointment', appointmentSchema);
