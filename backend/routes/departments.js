const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');
const { requireAuth, requireRole } = require('../middleware/auth');

// Get all departments
router.get('/', async (req, res) => {
  try {
    const departments = await Department.find().populate('head', 'name specialty');
    res.json(departments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a department (Admin only)
router.post('/', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const department = new Department(req.body);
    await department.save();
    res.status(201).json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update a department (Admin only)
router.put('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(department);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete a department (Admin only)
router.delete('/:id', requireAuth, requireRole('Admin'), async (req, res) => {
  try {
    // Check if doctors are still assigned to this department
    const doctorCount = await Doctor.countDocuments({ department: req.params.id });
    if (doctorCount > 0) {
      return res.status(400).json({ error: 'Cannot delete department with assigned doctors' });
    }
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get doctors in a department
router.get('/:id/doctors', async (req, res) => {
  try {
    const doctors = await Doctor.find({ department: req.params.id });
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
