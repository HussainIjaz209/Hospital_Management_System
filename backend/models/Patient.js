const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  age: { type: Number, required: true },
  gender: { type: String, required: true },
  contact: { type: String, required: true },
  bloodGroup: { type: String },
  address: { type: String },
  cnic: { type: String, unique: true, sparse: true },
  patientId: { type: String, unique: true },
  emergencyContact: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Patient', patientSchema);
