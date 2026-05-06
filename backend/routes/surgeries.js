const express = require('express');
const router = express.Router();
const Surgery = require('../models/Surgery');
const OperatingTheater = require('../models/OperatingTheater');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// --- OT ROUTES ---
router.get('/theaters', async (req, res) => {
  try {
    const theaters = await OperatingTheater.find();
    res.json(theaters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/theaters', requireRole('Admin'), async (req, res) => {
  try {
    const theater = new OperatingTheater(req.body);
    await theater.save();
    res.status(201).json(theater);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- SURGERY ROUTES ---
router.get('/', async (req, res) => {
  try {
    const surgeries = await Surgery.find()
      .populate('patient', 'name age gender')
      .populate('doctor', 'name specialty')
      .populate('operatingTheater', 'name type')
      .populate('medicinesUsed.medicine', 'name')
      .sort({ scheduledDate: 1 });
    res.json(surgeries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const surgery = new Surgery(req.body);
    await surgery.save();
    res.status(201).json(surgery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const surgery = await Surgery.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(surgery);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
