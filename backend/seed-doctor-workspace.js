const mongoose = require('mongoose');
require('dotenv').config();
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const seedDoctorWorkspace = async () => {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const patients = await Patient.find();
    const doctors = await Doctor.find();

    if (patients.length < 5 || doctors.length === 0) {
      console.log('Error: Need more patients and at least 1 doctor.');
      process.exit(1);
    }

    const doctorId = doctors[0]._id;
    const today = new Date();

    // Clear existing appointments for this doctor to rebuild a clean showcase
    await Appointment.deleteMany({ doctor: doctorId });

    const appointments = [
      // TODAY'S APPOINTMENTS (6)
      {
        patient: patients[0]._id,
        doctor: doctorId,
        date: new Date(today.setHours(9, 0, 0, 0)),
        reason: 'Post-op Follow-up',
        status: 'Completed',
        isEmergency: false
      },
      {
        patient: patients[1]._id,
        doctor: doctorId,
        date: new Date(today.setHours(10, 30, 0, 0)),
        reason: 'Chronic Hypertension Management',
        status: 'Scheduled',
        isEmergency: false
      },
      {
        patient: patients[2]._id,
        doctor: doctorId,
        date: new Date(today.setHours(11, 45, 0, 0)),
        reason: 'Acute Chest Pain',
        status: 'Scheduled',
        isEmergency: true
      },
      {
        patient: patients[3]._id,
        doctor: doctorId,
        date: new Date(today.setHours(14, 0, 0, 0)),
        reason: 'Annual Physical Examination',
        status: 'Scheduled',
        isEmergency: false
      },
      {
        patient: patients[4]._id,
        doctor: doctorId,
        date: new Date(today.setHours(15, 30, 0, 0)),
        reason: 'Blood Report Review',
        status: 'Scheduled',
        isEmergency: false
      },
      {
        patient: patients[0]._id,
        doctor: doctorId,
        date: new Date(today.setHours(16, 45, 0, 0)),
        reason: 'Severe Migraine',
        status: 'Scheduled',
        isEmergency: true
      },

      // UPCOMING APPOINTMENTS (4)
      {
        patient: patients[1]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() + 1)),
        reason: 'Diabetes Screening',
        status: 'Scheduled',
        isEmergency: false
      },
      {
        patient: patients[2]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() + 2)),
        reason: 'Cardiac Stress Test',
        status: 'Scheduled',
        isEmergency: false
      },
      {
        patient: patients[3]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() + 3)),
        reason: 'Orthopedic Consultation',
        status: 'Scheduled',
        isEmergency: false
      },

      // COMPLETED APPOINTMENTS (LAST WEEK) (5)
      {
        patient: patients[4]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() - 1)),
        reason: 'Fever & Cold',
        status: 'Completed',
        isEmergency: false
      },
      {
        patient: patients[0]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() - 2)),
        reason: 'Gastritis Treatment',
        status: 'Completed',
        isEmergency: false
      },
      {
        patient: patients[1]._id,
        doctor: doctorId,
        date: new Date(new Date().setDate(today.getDate() - 3)),
        reason: 'Asthma Follow-up',
        status: 'Completed',
        isEmergency: false
      }
    ];

    await Appointment.insertMany(appointments);
    console.log(`Successfully seeded ${appointments.length} appointments for the doctor.`);
    
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
};

seedDoctorWorkspace();
