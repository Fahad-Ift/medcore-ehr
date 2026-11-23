const express = require('express');
const pool = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// GET /api/labs/orders - Lab tech views pending and completed lab orders (no private diagnosis exposed)
router.get('/orders', verifyToken, authorizeRoles('LAB_TECH'), async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT lo.order_id, lo.test_type, lo.priority, lo.status, lo.ordered_at,
              p.full_name AS patient_name, p.blood_group, p.gender,
              d.full_name AS ordered_by_doctor,
              lr.metrics, lr.remarks, lr.verified_at
       FROM lab_orders lo
       JOIN medical_records mr ON lo.record_id = mr.record_id
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       JOIN patients p ON a.patient_id = p.patient_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
       ORDER BY FIELD(lo.status, 'PENDING', 'COMPLETED'), lo.ordered_at DESC`
    );
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch lab orders', error: err.message });
  }
});

// POST /api/labs/results - Lab tech submits test results (Trigger auto-completes order & logs audit)
router.post('/results', verifyToken, authorizeRoles('LAB_TECH'), async (req, res) => {
  const { order_id, metrics, remarks } = req.body;

  if (!order_id || !metrics) {
    return res.status(400).json({ message: 'Order ID and test metrics are required.' });
  }

  try {
    const [result] = await pool.query(
      'INSERT INTO lab_results (order_id, tech_id, metrics, remarks) VALUES (?, ?, ?, ?)',
      [order_id, req.user.userId, JSON.stringify(metrics), remarks || 'Verified within lab standards']
    );

    res.status(201).json({
      message: 'Lab result submitted and verified!',
      resultId: result.insertId
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Results have already been submitted for this order.' });
    }
    res.status(500).json({ message: 'Failed to submit lab result', error: err.message });
  }
});

module.exports = router;