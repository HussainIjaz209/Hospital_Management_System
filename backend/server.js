const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { seedData } = require('./seed');

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in backend/.env. Please set JWT_SECRET before starting the server.');
  process.exit(1);
}

const patientsRouter = require('./routes/patients');
const doctorsRouter = require('./routes/doctors');
const appointmentsRouter = require('./routes/appointments');
const authRouter = require('./routes/auth');
const statsRouter = require('./routes/stats');
const departmentsRouter = require('./routes/departments');
const recordsRouter = require('./routes/records');
const labRouter = require('./routes/lab');
const pharmacyRouter = require('./routes/pharmacy');
const wardsRouter = require('./routes/wards');
const surgeriesRouter = require('./routes/surgeries');
const billingRouter = require('./routes/billing');
const analyticsRouter = require('./routes/analytics');
const settingsRouter = require('./routes/settings');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/patients', patientsRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/stats', statsRouter);
app.use('/api/departments', departmentsRouter);
app.use('/api/records', recordsRouter);
app.use('/api/lab', labRouter);
app.use('/api/pharmacy', pharmacyRouter);
app.use('/api/wards', wardsRouter);
app.use('/api/surgeries', require('./routes/surgeries'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/billing', billingRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/settings', settingsRouter);

app.get('/', (req, res) => {
  res.send({ status: 'Hospital Management API is running' });
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital-db';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('Connected to MongoDB');
    await seedData();
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });
