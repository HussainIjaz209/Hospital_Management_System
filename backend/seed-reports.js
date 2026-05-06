const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const LabTest = require('./models/LabTest');
const LabReport = require('./models/LabReport');

const seedReports = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const patients = await Patient.find().limit(3);
    const doctors = await Doctor.find().limit(3);
    const tests = await LabTest.find().limit(5);

    if (patients.length === 0 || doctors.length === 0 || tests.length === 0) {
      console.log('Error: Need at least one patient, doctor, and lab test in the database.');
      process.exit(1);
    }

    const demoReports = [
      {
        patient: patients[0]._id,
        test: tests[0]._id,
        doctor: doctors[0]._id,
        status: 'Completed',
        priority: 'Urgent',
        result: 'Blood glucose levels are high (180 mg/dL). Immediate dietary adjustment and follow-up insulin sensitivity test recommended.',
        labTechnician: 'Tech. Robert Smith',
        completedAt: new Date(),
      },
      {
        patient: patients[0]._id,
        test: tests[1]._id,
        doctor: doctors[0]._id,
        status: 'Pending',
        priority: 'Urgent',
        labTechnician: 'Rad. Sarah Miller',
      },
      {
        patient: patients[1]._id,
        test: tests[2]._id,
        doctor: doctors[1]._id,
        status: 'Completed',
        priority: 'Normal',
        result: 'Cholesterol levels: LDL 130 mg/dL, HDL 50 mg/dL. Within acceptable range for age group.',
        labTechnician: 'Tech. Robert Smith',
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      },
      {
        patient: patients[2]._id,
        test: tests[3]._id,
        doctor: doctors[2]._id,
        status: 'Completed',
        priority: 'Urgent',
        result: 'Minor inflammation detected in the left knee joint. No fractures or ligament tears visible.',
        labTechnician: 'Rad. Sarah Miller',
        completedAt: new Date(),
      }
    ];

    await LabReport.insertMany(demoReports);
    console.log('Successfully seeded 4 demo lab reports (Urgent & Completed).');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedReports();
