const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// Get all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new medicine (Admin/Pharmacist)
router.post('/', requireRole(['Admin', 'Pharmacist']), async (req, res) => {
  try {
    const medicine = new Medicine(req.body);
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update medicine or stock
router.put('/:id', requireRole(['Admin', 'Pharmacist']), async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(medicine);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete medicine
router.delete('/:id', requireRole('Admin'), async (req, res) => {
  try {
    await Medicine.findByIdAndDelete(req.params.id);
    res.json({ message: 'Medicine removed from inventory' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
