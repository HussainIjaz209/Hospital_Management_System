const express = require('express');
const Doctor = require('../models/Doctor');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find().populate('department', 'name').sort({ createdAt: -1 });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch doctors' });
  }
});

router.post('/', async (req, res) => {
  try {
    const doctor = new Doctor(req.body);
    await doctor.save();
    res.status(201).json(doctor);
  } catch (error) {
    res.status(400).json({ error: 'Invalid doctor data' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(doctor);
  } catch (error) {
    res.status(400).json({ error: error.message || 'Unable to update doctor' });
  }
});

router.delete('/:id', requireRole('Admin'), async (req, res) => {
  try {
    await Doctor.findByIdAndDelete(req.params.id);
    res.json({ message: 'Doctor removed' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete doctor' });
  }
});

module.exports = router;
