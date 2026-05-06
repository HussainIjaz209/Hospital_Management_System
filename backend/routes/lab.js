const express = require('express');
const router = express.Router();
const LabTest = require('../models/LabTest');
const LabReport = require('../models/LabReport');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// --- TEST CATALOG (Pricing & Setup) ---

// Get all test types
router.get('/tests', async (req, res) => {
  try {
    const tests = await LabTest.find().sort({ category: 1, name: 1 });
    res.json(tests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create/Update test type (Admin Only)
router.post('/tests', requireRole('Admin'), async (req, res) => {
  try {
    const test = new LabTest(req.body);
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/tests/:id', requireRole('Admin'), async (req, res) => {
  try {
    const test = await LabTest.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// --- PATIENT REPORTS (Daily Operations) ---

// Get all reports (with optional patient filter)
router.get('/reports', async (req, res) => {
  try {
    const query = {};
    if (req.query.patient) query.patient = req.query.patient;
    
    const reports = await LabReport.find(query)
      .populate('patient', 'name')
      .populate('test', 'name category price')
      .populate('doctor', 'name')
      .sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new report request
router.post('/reports', async (req, res) => {
  try {
    const report = new LabReport(req.body);
    await report.save();
    res.status(201).json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update report (status, result, etc.)
router.put('/reports/:id', async (req, res) => {
  try {
    const data = req.body;
    const report = await LabReport.findByIdAndUpdate(req.params.id, data, { new: true })
      .populate('patient', 'name')
      .populate('test', 'name')
      .populate('doctor', 'name email');

    // Notify Doctor if report is completed
    if (data.status === 'Completed' && report.doctor) {
      const { sendNotification } = require('../utils/notificationHelper');
      await sendNotification({
        recipientEmail: report.doctor.email,
        title: '🧪 Lab Report Ready',
        message: `Investigation results for ${report.patient?.name} (${report.test?.name}) are now available.`,
        type: 'LabReport',
        priority: report.priority === 'Urgent' ? 'High' : 'Normal',
        link: '/consultation'
      });
    }

    res.json(report);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
