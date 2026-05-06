const mongoose = require('mongoose');

const roles = [
  'Admin',
  'Doctor',
  'Receptionist',
  'Lab Technician',
  'Ward Manager',
  'Pharmacist',
  'Billing Specialist',
  'Nurse'
];

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String },
  password: { type: String, required: true },
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const rolePermissions = {
  'Admin': ['all'],
  'Doctor': ['view_patients', 'manage_appointments', 'medical_records'],
  'Receptionist': ['register_patients', 'schedule_appointments', 'billing'],
  'Lab Technician': ['lab_tests', 'view_reports'],
  'Pharmacist': ['inventory', 'prescriptions'],
  'Nurse': ['view_patients', 'vitals_entry'],
  'Ward Manager': ['bed_management', 'ward_status'],
  'Billing Specialist': ['invoicing', 'payments']
};

module.exports = {
  User: mongoose.model('User', userSchema),
  roles,
  rolePermissions,
};
