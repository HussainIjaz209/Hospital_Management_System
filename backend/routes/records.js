const express = require('express');
const router = express.Router();
const MedicalRecord = require('../models/MedicalRecord');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// Create a medical record (Doctors/Admins)
router.post('/', requireRole('Admin', 'Doctor'), async (req, res) => {
  try {
    const record = new MedicalRecord(req.body);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get records for a specific patient
router.get('/patient/:patientId', async (req, res) => {
  try {
    const records = await MedicalRecord.find({ patient: req.params.patientId })
      .populate('doctor', 'name specialty')
      .sort({ date: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
