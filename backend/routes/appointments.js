const express = require('express');
const Appointment = require('../models/Appointment');
const { requireAuth, requireRole } = require('../middleware/auth');
const router = express.Router();

router.use(requireAuth);

router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patient', 'name')
      .populate('doctor', 'name specialty')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch appointments' });
  }
});

router.post('/', async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    const populated = await appointment.populate('patient', 'name').populate('doctor', 'name email specialty');
    
    // Notify Doctor
    const { sendNotification } = require('../utils/notificationHelper');
    await sendNotification({
      recipientEmail: populated.doctor?.email,
      title: populated.isEmergency ? '🚨 EMERGENCY CASE' : 'New Appointment Scheduled',
      message: `${populated.isEmergency ? 'URGENT: ' : ''}You have a new appointment with ${populated.patient?.name} on ${new Date(populated.date).toLocaleString()}.`,
      type: populated.isEmergency ? 'Emergency' : 'Appointment',
      priority: populated.isEmergency ? 'Urgent' : 'Normal',
      link: '/consultation'
    });

    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ error: 'Invalid appointment data' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patient', 'name')
      .populate('doctor', 'name specialty');
    res.json(appointment);
  } catch (error) {
    res.status(400).json({ error: 'Unable to update appointment' });
  }
});

router.delete('/:id', requireRole('Admin', 'Receptionist'), async (req, res) => {
  try {
    await Appointment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Appointment removed' });
  } catch (error) {
    res.status(500).json({ error: 'Unable to delete appointment' });
  }
});

module.exports = router;
