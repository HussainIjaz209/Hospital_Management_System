const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

// Get all invoices with filtering
router.get('/', async (req, res) => {
  try {
    const { status, timeframe, start, end } = req.query;
    let query = {};

    if (status) query.status = status;

    // Timeframe logic
    if (timeframe || (start && end)) {
      let startDate = new Date();
      let endDate = new Date();

      if (timeframe === 'daily') {
        startDate.setHours(0, 0, 0, 0);
      } else if (timeframe === 'weekly') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeframe === 'monthly') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (start && end) {
        startDate = new Date(start);
        endDate = new Date(end);
      }
      query.createdAt = { $gte: startDate, $lte: endDate };
    }

    const invoices = await Invoice.find(query)
      .populate('patient', 'name email contact')
      .sort({ createdAt: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new invoice
router.post('/', requireRole('Admin', 'Billing Specialist'), async (req, res) => {
  try {
    const invoice = new Invoice(req.body);
    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update invoice (Mark as paid, etc.)
router.put('/:id', requireRole('Admin', 'Billing Specialist'), async (req, res) => {
  try {
    const data = req.body;
    if (data.status === 'Paid') data.paidDate = Date.now();
    const invoice = await Invoice.findByIdAndUpdate(req.params.id, data, { new: true });
    res.json(invoice);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get financial reports
router.get('/report', requireRole('Admin'), async (req, res) => {
  try {
    const stats = await Invoice.aggregate([
      {
        $group: {
          _id: '$status',
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await Invoice.aggregate([
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.category',
          revenue: { $sum: '$items.amount' }
        }
      }
    ]);

    res.json({ statusStats: stats, departmentStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
