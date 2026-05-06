const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  isOnDuty: { type: Boolean, default: false },
  department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  experience: { type: Number, default: 0 }, // Years of experience
  consultationFee: { type: Number, default: 0 },
  imageUrl: { type: String },
  availability: [{
    day: { type: String, enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
    startTime: { type: String }, // e.g., "09:00"
    endTime: { type: String }   // e.g., "17:00"
  }],
}, { timestamps: true });

module.exports = mongoose.model('Doctor', doctorSchema);
