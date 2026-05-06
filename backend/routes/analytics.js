const express = require('express');
const router = express.Router();
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');
const Invoice = require('../models/Invoice');
const { requireAuth, requireRole } = require('../middleware/auth');

router.use(requireAuth);

router.get('/dashboard', requireRole('Admin'), async (req, res) => {
  try {
    // 1. Patient Demographics (Gender)
    const genderData = await Patient.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } }
    ]);

    // 2. Doctor Performance (Appointments per doctor)
    const doctorStats = await Appointment.aggregate([
      { $group: { _id: '$doctor', count: { $sum: 1 } } },
      { $lookup: { from: 'doctors', localField: '_id', foreignField: '_id', as: 'doctorInfo' } },
      { $unwind: '$doctorInfo' },
      { $project: { name: '$doctorInfo.name', count: 1 } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 3. Department Revenue (from Invoices)
    const deptRevenue = await Invoice.aggregate([
      { $unwind: '$items' },
      { $group: { _id: '$items.category', value: { $sum: '$items.amount' } } }
    ]);

    // 4. Monthly Revenue Trend
    const monthlyRevenue = await Invoice.aggregate([
      {
        $group: {
          _id: { $month: '$createdAt' },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id': 1 } }
    ]);

    res.json({
      genderData: genderData.map(d => ({ name: d._id, value: d.count })),
      doctorStats,
      deptRevenue: deptRevenue.map(d => ({ name: d._id, value: d.value })),
      monthlyRevenue: monthlyRevenue.map(m => ({ 
        month: new Date(2024, m._id - 1).toLocaleString('default', { month: 'short' }), 
        revenue: m.revenue 
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
