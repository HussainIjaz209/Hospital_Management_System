const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const { User } = require('./models/User');
const Doctor = require('./models/Doctor');
const Bed = require('./models/Bed');
const Patient = require('./models/Patient');
const Appointment = require('./models/Appointment');
const Department = require('./models/Department');
const MedicalRecord = require('./models/MedicalRecord');
const LabTest = require('./models/LabTest');
const LabReport = require('./models/LabReport');
const Medicine = require('./models/Medicine');
const Ward = require('./models/Ward');
const OperatingTheater = require('./models/OperatingTheater');
const Surgery = require('./models/Surgery');
const Invoice = require('./models/Invoice');

const demoUsers = [
  { email: 'admin@example.com', password: 'Admin123!', role: 'Admin' },
  { email: 'doctor@example.com', password: 'Doctor123!', role: 'Doctor' },
  { email: 'reception@example.com', password: 'Reception123!', role: 'Receptionist' },
  { email: 'lab@example.com', password: 'Lab123!', role: 'Lab Technician' },
  { email: 'ward@example.com', password: 'Ward123!', role: 'Ward Manager' },
  { email: 'pharmacy@example.com', password: 'Pharmacy123!', role: 'Pharmacist' },
  { email: 'billing@example.com', password: 'Billing123!', role: 'Billing Specialist' },
  { email: 'nurse@example.com', password: 'Nurse123!', role: 'Nurse' }
];

async function seedData() {
  // Seed Users
  for (const item of demoUsers) {
    const existing = await User.findOne({ email: item.email });
    if (existing) continue;

    const hashedPassword = await bcrypt.hash(item.password, 10);
    await User.create({ email: item.email, password: hashedPassword, role: item.role });
    console.log(`Created demo user: ${item.email}`);
  }

  // Seed Departments if empty
  const deptCount = await Department.countDocuments();
  if (deptCount === 0) {
    const departments = [
      { name: 'Cardiology', description: 'Deals with disorders of the heart and the circulatory system.' },
      { name: 'Neurology', description: 'Deals with disorders of the nervous system.' },
      { name: 'Pediatrics', description: 'Medical care of infants, children, and adolescents.' },
      { name: 'Orthopedics', description: 'Focuses on the musculoskeletal system.' },
      { name: 'Dermatology', description: 'Specializes in conditions of the skin, hair, and nails.' }
    ];
    await Department.insertMany(departments);
    console.log('Seeded 5 departments.');
  }

  // Seed Beds if empty
  const bedCount = await Bed.countDocuments();
  if (bedCount === 0) {
    const beds = [];
    for (let i = 1; i <= 50; i++) {
      beds.push({
        number: `B-${i.toString().padStart(3, '0')}`,
        type: i <= 5 ? 'ICU' : i <= 15 ? 'Emergency' : 'General',
        isOccupied: Math.random() > 0.7
      });
    }
    await Bed.insertMany(beds);
    console.log('Seeded 50 hospital beds.');
  }

  // Seed Doctors if empty
  const docCount = await Doctor.countDocuments();
  if (docCount === 0) {
    const depts = await Department.find();
    const doctors = [
      { name: 'Dr. Sarah Wilson', specialty: 'Cardiology', phone: '555-0101', email: 'sarah@hospital.com', isOnDuty: true, department: depts[0]._id },
      { name: 'Dr. James Chen', specialty: 'Neurology', phone: '555-0102', email: 'james@hospital.com', isOnDuty: true, department: depts[1]._id },
      { name: 'Dr. Michael Brown', specialty: 'Pediatrics', phone: '555-0103', email: 'michael@hospital.com', isOnDuty: true, department: depts[2]._id },
      { name: 'Dr. Emily Davis', specialty: 'Orthopedics', phone: '555-0104', email: 'emily@hospital.com', isOnDuty: false, department: depts[3]._id },
      { name: 'Dr. Robert Taylor', specialty: 'Dermatology', phone: '555-0105', email: 'robert@hospital.com', isOnDuty: false, department: depts[4]._id }
    ];
    await Doctor.insertMany(doctors);
    console.log('Seeded 5 doctors.');
  }

  // Seed Patients if empty
  const patientCount = await Patient.countDocuments();
  if (patientCount === 0) {
    const patients = [
      { name: 'John Doe', age: 45, gender: 'Male', contact: '555-1001', notes: 'Hypertension' },
      { name: 'Jane Smith', age: 32, gender: 'Female', contact: '555-1002', notes: 'Asthma' },
      { name: 'Alice Johnson', age: 28, gender: 'Female', contact: '555-1003', notes: 'Routine checkup' }
    ];
    await Patient.insertMany(patients);
    console.log('Seeded 3 patients.');
  }

  // Seed Appointments if empty
  const apptCount = await Appointment.countDocuments();
  if (apptCount === 0) {
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const appointments = [];
    
    for (let i = 0; i < 15; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (i % 7)); // Spread over last 7 days
      appointments.push({
        patient: patients[i % patients.length]._id,
        doctor: doctors[i % doctors.length]._id,
        date: date,
        reason: 'General Consultation',
        status: 'Scheduled',
        isEmergency: i % 5 === 0
      });
    }
    await Appointment.insertMany(appointments);
    console.log('Seeded 15 appointments.');
  }

  // Seed Medical Records if empty
  const recordCount = await MedicalRecord.countDocuments();
  if (recordCount === 0) {
    const patients = await Patient.find();
    const doctors = await Doctor.find();
    const records = [
      {
        patient: patients[0]._id,
        doctor: doctors[0]._id,
        diagnosis: 'Stage 1 Hypertension',
        treatment: 'Dietary changes and regular exercise',
        prescription: 'Lisinopril 10mg daily',
        notes: 'Patient advised to monitor blood pressure at home.',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      },
      {
        patient: patients[0]._id,
        doctor: doctors[1]._id,
        diagnosis: 'Mild Migraine',
        treatment: 'Stress management and hydration',
        prescription: 'Sumatriptan as needed',
        notes: 'Triggered by sleep deprivation.',
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      },
      {
        patient: patients[1]._id,
        doctor: doctors[2]._id,
        diagnosis: 'Acute Bronchitis',
        treatment: 'Humidifier use and rest',
        prescription: 'Albuterol inhaler',
        notes: 'Review in 2 weeks if cough persists.',
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
      }
    ];
    await MedicalRecord.insertMany(records);
    console.log('Seeded demo medical records.');
  }

  // Seed Lab Tests if empty
  const labTestCount = await LabTest.countDocuments();
  if (labTestCount === 0) {
    const labTests = [
      { name: 'Complete Blood Count (CBC)', category: 'Blood Work', price: 35, tat: '12 Hours', description: 'Measures different components of the blood.' },
      { name: 'Chest X-Ray', category: 'Imaging', price: 75, tat: '2 Hours', description: 'Standard imaging of the chest area.' },
      { name: 'Lipid Profile', category: 'Blood Work', price: 50, tat: '24 Hours', description: 'Measures cholesterol and triglyceride levels.' },
      { name: 'Brain MRI', category: 'Imaging', price: 450, tat: '48 Hours', description: 'High-detail imaging of the brain.' },
      { name: 'Liver Function Test (LFT)', category: 'Blood Work', price: 65, tat: '24 Hours', description: 'Evaluates the performance of the liver.' }
    ];
    await LabTest.insertMany(labTests);
    console.log('Seeded 5 lab test types.');
  }

  // Seed Lab Reports if empty
  const labReportCount = await LabReport.countDocuments();
  if (labReportCount === 0) {
    const patients = await Patient.find();
    const tests = await LabTest.find();
    const doctors = await Doctor.find();
    
    const labReports = [
      {
        patient: patients[0]._id,
        test: tests[0]._id,
        doctor: doctors[0]._id,
        status: 'Completed',
        result: 'WBC and RBC levels are within normal range. Hemoglobin: 14.2 g/dL.',
        labTechnician: 'Tech. Robert Smith',
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        patient: patients[0]._id,
        test: tests[1]._id,
        doctor: doctors[0]._id,
        status: 'Completed',
        result: 'No evidence of acute pneumonia or pleural effusion. Heart size is normal.',
        labTechnician: 'Rad. Sarah Miller',
        completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        patient: patients[1]._id,
        test: tests[2]._id,
        doctor: doctors[2]._id,
        status: 'Pending',
        labTechnician: 'Tech. Robert Smith'
      }
    ];
    await LabReport.insertMany(labReports);
    console.log('Seeded demo lab reports.');
  }

  // Seed Medicines
  const medicines = [
    { name: 'Panadol', genericName: 'Paracetamol', category: 'Tablet', stock: 150, minStockLevel: 20, price: 5.50, manufacturer: 'GSK', location: 'Shelf A-1' },
    { name: 'Amoxicillin', genericName: 'Amoxicillin', category: 'Capsule', stock: 8, minStockLevel: 15, price: 12.00, manufacturer: 'Pfizer', location: 'Shelf B-2' },
    { name: 'Benadryl', genericName: 'Diphenhydramine', category: 'Syrup', stock: 45, minStockLevel: 10, price: 8.75, manufacturer: 'J&J', location: 'Shelf C-1' },
    { name: 'Insulin Glargine', genericName: 'Insulin', category: 'Injection', stock: 5, minStockLevel: 10, price: 45.00, manufacturer: 'Sanofi', location: 'Fridge 1' },
    { name: 'Betadine', genericName: 'Povidone-iodine', category: 'Ointment', stock: 30, minStockLevel: 5, price: 6.25, manufacturer: 'Mundipharma', location: 'Shelf D-4' },
    { name: 'Brufen', genericName: 'Ibuprofen', category: 'Tablet', stock: 80, minStockLevel: 15, price: 4.50, manufacturer: 'Abbott', location: 'Shelf A-2' },
    { name: 'Augmentin', genericName: 'Co-amoxiclav', category: 'Tablet', stock: 12, minStockLevel: 20, price: 18.50, manufacturer: 'GSK', location: 'Shelf B-1' }
  ];
  await Medicine.deleteMany({}); // Clear existing to avoid duplicates during this force seed
  await Medicine.insertMany(medicines);
  console.log('Seeded 7 medicine types.');

  // Seed Wards
  const nurses = await User.find({ role: 'Nurse' });
  const wards = [
    { name: 'Ward 101', type: 'General', floor: '1st Floor', capacity: 10, assignedNurse: nurses[0]?._id },
    { name: 'ICU-A', type: 'ICU', floor: '2nd Floor', capacity: 5, assignedNurse: nurses[1]?._id || nurses[0]?._id },
    { name: 'Private Wing', type: 'Private', floor: '3rd Floor', capacity: 8, assignedNurse: nurses[0]?._id }
  ];
  await Ward.deleteMany({});
  const createdWards = await Ward.insertMany(wards);
  console.log('Seeded 3 hospital wards.');

  // Seed Beds linked to Wards
  const patients = await Patient.find();
  const beds = [];
  
  // General Ward Beds
  for (let i = 1; i <= 10; i++) {
    beds.push({
      number: `G-${100 + i}`,
      type: 'General',
      ward: createdWards[0]._id,
      isOccupied: i <= 3,
      patient: i <= 3 ? patients[i-1]?._id : null
    });
  }
  
  // ICU Beds
  for (let i = 1; i <= 5; i++) {
    beds.push({
      number: `ICU-${i}`,
      type: 'ICU',
      ward: createdWards[1]._id,
      isOccupied: i === 1,
      patient: i === 1 ? patients[2]?._id : null
    });
  }

  await Bed.deleteMany({});
  await Bed.insertMany(beds);
  console.log('Seeded hospital beds with assignments.');

  // Seed Operating Theaters
  const theaters = [
    { name: 'OT-1 (Cardiac)', type: 'Cardiac', floor: '4th Floor' },
    { name: 'OT-2 (General)', type: 'General', floor: '4th Floor' },
    { name: 'OT-3 (Ortho)', type: 'Orthopedic', floor: '4th Floor' }
  ];
  await OperatingTheater.deleteMany({});
  const createdOTs = await OperatingTheater.insertMany(theaters);
  console.log('Seeded 3 Operating Theaters.');

  // Seed Surgeries
  const doctors = await Doctor.find();
  const allMedicines = await Medicine.find();
  const surgeryDemo = [
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      operatingTheater: createdOTs[0]._id,
      procedureName: 'Coronary Artery Bypass',
      scheduledDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      durationMinutes: 180,
      status: 'Scheduled'
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      operatingTheater: createdOTs[1]._id,
      procedureName: 'Appendectomy',
      scheduledDate: new Date(Date.now() - 1 * 60 * 60 * 1000), // Started 1 hour ago
      durationMinutes: 90,
      status: 'Ongoing',
      medicinesUsed: [
        { medicine: allMedicines[0]._id, quantity: 2, isReturned: false },
        { medicine: allMedicines[1]._id, quantity: 1, isReturned: false }
      ]
    },
    {
      patient: patients[2]._id,
      doctor: doctors[2]._id,
      operatingTheater: createdOTs[2]._id,
      procedureName: 'Knee Replacement',
      scheduledDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      durationMinutes: 120,
      status: 'Completed',
      notes: 'Surgery successful. Patient moved to post-op recovery.'
    }
  ];
  await Surgery.deleteMany({});
  await Surgery.insertMany(surgeryDemo);
  console.log('Seeded 3 demo surgeries.');

  // Seed Invoices
  const invoices = [
    {
      invoiceNumber: 'INV-2024-001',
      patient: patients[0]._id,
      items: [
        { description: 'Cardiac Consultation', category: 'Consultation', amount: 150 },
        { description: 'ECG Test', category: 'Lab', amount: 80 }
      ],
      totalAmount: 230,
      status: 'Paid',
      paymentMethod: 'Card',
      paidDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
    },
    {
      invoiceNumber: 'INV-2024-002',
      patient: patients[1]._id,
      items: [
        { description: 'Surgery: Appendectomy', category: 'Surgery', amount: 1200 },
        { description: 'Post-Op Medicine Bundle', category: 'Pharmacy', amount: 145 }
      ],
      totalAmount: 1345,
      status: 'Paid',
      paymentMethod: 'Insurance',
      paidDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    },
    {
      invoiceNumber: 'INV-2024-003',
      patient: patients[2]._id,
      items: [
        { description: 'Routine Checkup', category: 'Consultation', amount: 75 },
        { description: 'Blood Work (CBC)', category: 'Lab', amount: 35 },
        { description: 'Antibiotics', category: 'Pharmacy', amount: 25 }
      ],
      totalAmount: 135,
      status: 'Pending',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  ];
  await Invoice.deleteMany({});
  await Invoice.insertMany(invoices);
  console.log('Seeded 3 demo invoices.');

  // Seed more Appointments for Doctor Dashboard
  const extraAppointments = [
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      date: new Date(), // Today
      reason: 'Chest Pain',
      status: 'Scheduled',
      isEmergency: true
    },
    {
      patient: patients[1]._id,
      doctor: doctors[0]._id,
      date: new Date(Date.now() + 2 * 60 * 60 * 1000), // In 2 hours
      reason: 'Follow-up',
      status: 'Scheduled'
    },
    {
      patient: patients[2]._id,
      doctor: doctors[0]._id,
      date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      reason: 'Regular Checkup',
      status: 'Completed'
    },
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      reason: 'Heart Scan',
      status: 'Scheduled'
    }
  ];
  await Appointment.insertMany(extraAppointments);
  console.log('Seeded extra appointments for Doctor demo.');

  console.log('Hospital data seeding completed.');
}

module.exports = { seedData };

if (require.main === module) {
  const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';
  mongoose.connect(MONGO_URI)
    .then(() => {
      console.log('Connected to MongoDB for seeding...');
      return seedData();
    })
    .then(() => {
      console.log('Seeding finished.');
      process.exit(0);
    })
    .catch(err => {
      console.error('Seeding error:', err);
      process.exit(1);
    });
}
