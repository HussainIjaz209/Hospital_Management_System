const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['Appointment', 'LabReport', 'Emergency', 'System', 'Other'], 
    default: 'Other' 
  },
  priority: { type: String, enum: ['Normal', 'High', 'Urgent'], default: 'Normal' },
  isRead: { type: Boolean, default: false },
  link: { type: String }, // Optional link to redirect user
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
