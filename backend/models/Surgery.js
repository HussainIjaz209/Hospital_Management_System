const mongoose = require('mongoose');

const surgerySchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true }, // Lead Surgeon
  assistantDoctors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' }],
  operatingTheater: { type: mongoose.Schema.Types.ObjectId, ref: 'OperatingTheater', required: true },
  procedureName: { type: String, required: true },
  scheduledDate: { type: Date, required: true },
  durationMinutes: { type: Number, default: 60 },
  status: { 
    type: String, 
    enum: ['Scheduled', 'Preparation', 'Ongoing', 'Completed', 'Cancelled', 'Post-Op'], 
    default: 'Scheduled' 
  },
  medicinesUsed: [{
    medicine: { type: mongoose.Schema.Types.ObjectId, ref: 'Medicine' },
    quantity: { type: Number },
    isReturned: { type: Boolean, default: false }
  }],
  notes: { type: String },
  complications: { type: String },
  result: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Surgery', surgerySchema);
