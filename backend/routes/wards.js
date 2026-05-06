const express = require('express');
const router = express.Router();
const Ward = require('../models/Ward');
const Bed = require('../models/Bed');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// --- WARD ROUTES ---

router.get('/', async (req, res) => {
  try {
    const wards = await Ward.find().populate('assignedNurse', 'username email');
    res.json(wards);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireRole('Admin'), async (req, res) => {
  try {
    const ward = new Ward(req.body);
    await ward.save();
    res.status(201).json(ward);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- BED ROUTES ---

router.get('/beds', async (req, res) => {
  try {
    const beds = await Bed.find()
      .populate('ward', 'name type floor')
      .populate('patient', 'name age gender bloodGroup contact')
      .sort({ number: 1 });
    res.json(beds);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update bed status (Assign Patient / Occupy)
router.put('/beds/:id', async (req, res) => {
  try {
    const bed = await Bed.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(bed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add new bed (Admin)
router.post('/beds', requireRole('Admin'), async (req, res) => {
  try {
    const bed = new Bed(req.body);
    await bed.save();
    res.status(201).json(bed);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
