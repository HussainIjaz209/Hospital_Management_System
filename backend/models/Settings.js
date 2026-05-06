const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  hospitalName: { type: String, default: 'MediCenter Hospital' },
  hospitalLogo: { type: String }, // URL or Base64
  workingHours: {
    start: { type: String, default: '08:00' },
    end: { type: String, default: '20:00' }
  },
  currency: {
    code: { type: String, default: 'USD' },
    symbol: { type: String, default: '$' }
  },
  notifications: {
    emailAlerts: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    appointmentReminders: { type: Boolean, default: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
