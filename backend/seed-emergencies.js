const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const seedEmergencies = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    let patients = await Patient.find().limit(5);
    const doctors = await Doctor.find().limit(3);

    if (patients.length < 4) {
      console.log('Not enough patients. Seeding more...');
      const extraPatients = [
        { name: 'Michael Ross', age: 29, gender: 'Male', contact: '555-2001', notes: 'No history' },
        { name: 'Sarah Miller', age: 54, gender: 'Female', contact: '555-2002', notes: 'Diabetic' },
        { name: 'David Wilson', age: 41, gender: 'Male', contact: '555-2003', notes: 'Smoker' }
      ];
      await Patient.insertMany(extraPatients);
      patients = await Patient.find().limit(5);
    }

    if (doctors.length === 0) {
      console.log('Error: Need at least 1 doctor in the database.');
      process.exit(1);
    }

    // Clear existing emergency appointments to keep it clean for showcase
    await Appointment.deleteMany({ isEmergency: true });

    const emergencies = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        date: new Date(),
        reason: 'Acute Chest Pain - Rule out MI',
        status: 'Scheduled',
        isEmergency: true
      },
      {
        patient: patients[1]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() + 10 * 60 * 1000), // In 10 mins
        reason: 'Severe Respiratory Distress',
        status: 'Scheduled',
        isEmergency: true
      },
      {
        patient: patients[2]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() + 20 * 60 * 1000), // In 20 mins
        reason: 'Trauma - Fall from height',
        status: 'Scheduled',
        isEmergency: true
      },
      {
        patient: patients[3]._id,
        doctor: doctors[0]._id,
        date: new Date(Date.now() - 5 * 60 * 1000), // Started 5 mins ago
        reason: 'Allergic Reaction - Anaphylaxis',
        status: 'Scheduled',
        isEmergency: true
      }
    ];

    await Appointment.insertMany(emergencies);
    console.log('Successfully seeded 4 critical emergency cases.');
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedEmergencies();
