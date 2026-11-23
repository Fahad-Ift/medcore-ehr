const express = require('express');
const pool = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/appointments/doctors - List all doctors for booking
router.get('/doctors', verifyToken, async (req, res) => {
  try {
    const [doctors] = await pool.query(
      'SELECT doctor_id, full_name, license_number, specialization, consultation_fee FROM doctors ORDER BY full_name'
    );
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch doctors', error: err.message });
  }
});

// GET /api/appointments/my - Get appointments for logged-in Patient or Doctor
router.get('/my', verifyToken, async (req, res) => {
  try {
    if (req.user.role === 'PATIENT') {
      const [rows] = await pool.query(
        'SELECT * FROM vw_doctor_appointments WHERE patient_id = ? ORDER BY slot_date DESC, slot_time DESC',
        [req.user.userId]
      );
      return res.json(rows);
    }

    if (req.user.role === 'DOCTOR') {
      const [rows] = await pool.query(
        'SELECT * FROM vw_doctor_appointments WHERE doctor_id = ? ORDER BY slot_date ASC, slot_time ASC',
        [req.user.userId]
      );
      return res.json(rows);
    }

    res.status(403).json({ message: 'Not applicable for this role.' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
  }
});

// POST /api/appointments - Patient books an appointment slot
router.post('/', verifyToken, authorizeRoles('PATIENT'), async (req, res) => {
  const { doctor_id, slot_date, slot_time, reason } = req.body;

  if (!doctor_id || !slot_date || !slot_time) {
    return res.status(400).json({ message: 'Doctor, date, and time slot are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO appointments (patient_id, doctor_id, slot_date, slot_time, reason) VALUES (?, ?, ?, ?, ?)',
      [req.user.userId, doctor_id, slot_date, slot_time, reason || 'General Consultation']
    );

    res.status(201).json({
      message: 'Appointment booked successfully!',
      appointmentId: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'Slot conflict: This doctor is already booked at that date and time.'
      });
    }
    res.status(500).json({ message: 'Booking failed', error: err.message });
  }
});

module.exports = router;