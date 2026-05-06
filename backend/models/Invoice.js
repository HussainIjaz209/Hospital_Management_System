const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  items: [{
    description: { type: String, required: true },
    category: { type: String, enum: ['Consultation', 'Lab', 'Pharmacy', 'Surgery', 'Ward', 'Other'], required: true },
    amount: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Pending', 'Partially Paid', 'Cancelled'], default: 'Pending' },
  paymentMethod: { type: String, enum: ['Cash', 'Card', 'Insurance', 'Online'], default: 'Cash' },
  dueDate: { type: Date },
  paidDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
