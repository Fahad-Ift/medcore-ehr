const express = require('express');
const pool = require('../config/db');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

const router = express.Router();

// POST /api/records/consult - Doctor completes a consultation atomically
router.post('/consult', verifyToken, authorizeRoles('DOCTOR'), async (req, res) => {
  const {
    appointment_id,
    diagnosis_code,
    diagnosis_title,
    doctor_notes,
    vitals,
    medicines,
    lab_tests
  } = req.body;

  if (!appointment_id || !diagnosis_code || !diagnosis_title || !doctor_notes) {
    return res.status(400).json({ message: 'Appointment ID, diagnosis, and notes are required.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Verify the appointment belongs to this doctor
    const [appts] = await connection.query(
      'SELECT * FROM appointments WHERE appointment_id = ? AND doctor_id = ?',
      [appointment_id, req.user.userId]
    );
    if (appts.length === 0) {
      throw new Error('Appointment not found or unauthorized.');
    }

    // 1. Insert Medical Record (Trigger automatically updates appointment status & writes audit_logs)
    const [recResult] = await connection.query(
      'INSERT INTO medical_records (appointment_id, diagnosis_code, diagnosis_title, doctor_notes, vitals) VALUES (?, ?, ?, ?, ?)',
      [appointment_id, diagnosis_code, diagnosis_title, doctor_notes, JSON.stringify(vitals || {})]
    );
    const recordId = recResult.insertId;

    // 2. Insert Prescription & Weak Entity Prescription Items (if medicines provided)
    if (Array.isArray(medicines) && medicines.length > 0) {
      const [prescResult] = await connection.query(
        'INSERT INTO prescriptions (record_id, issued_date, valid_until) VALUES (?, CURDATE(), DATE_ADD(CURDATE(), INTERVAL 7 DAY))',
        [recordId]
      );
      const prescriptionId = prescResult.insertId;

      for (let i = 0; i < medicines.length; i++) {
        const med = medicines[i];
        await connection.query(
          'INSERT INTO prescription_items (prescription_id, item_number, medicine_name, dosage, frequency, duration_days) VALUES (?, ?, ?, ?, ?, ?)',
          [prescriptionId, i + 1, med.medicine_name, med.dosage, med.frequency, med.duration_days || 5]
        );
      }
    }

    // 3. Insert Lab Orders (if tests ordered)
    if (Array.isArray(lab_tests) && lab_tests.length > 0) {
      for (const test of lab_tests) {
        await connection.query(
          'INSERT INTO lab_orders (record_id, test_type, priority) VALUES (?, ?, ?)',
          [recordId, test.test_type, test.priority || 'ROUTINE']
        );
      }
    }

    await connection.commit();
    res.status(201).json({ message: 'Consultation recorded successfully!', recordId });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: 'Failed to save consultation', error: err.message });
  } finally {
    connection.release();
  }
});

// GET /api/records/patient - Patient views their medical records, prescriptions, lab results, and audit logs
router.get('/patient', verifyToken, authorizeRoles('PATIENT'), async (req, res) => {
  try {
    const [records] = await pool.query(
      `SELECT mr.*, a.slot_date, a.slot_time, d.full_name AS doctor_name, d.specialization
       FROM medical_records mr
       JOIN appointments a ON mr.appointment_id = a.appointment_id
       JOIN doctors d ON a.doctor_id = d.doctor_id
       WHERE a.patient_id = ?
       ORDER BY mr.created_at DESC`,
      [req.user.userId]
    );

    for (const rec of records) {
      const [prescriptions] = await pool.query(
        'SELECT * FROM prescriptions WHERE record_id = ?',
        [rec.record_id]
      );
      if (prescriptions.length > 0) {
        const [items] = await pool.query(
          'SELECT * FROM prescription_items WHERE prescription_id = ? ORDER BY item_number ASC',
          [prescriptions[0].prescription_id]
        );
        prescriptions[0].items = items;
        rec.prescription = prescriptions[0];
      } else {
        rec.prescription = null;
      }

      const [labs] = await pool.query(
        `SELECT lo.*, lr.metrics, lr.remarks, lr.verified_at, lt.full_name AS tech_name
         FROM lab_orders lo
         LEFT JOIN lab_results lr ON lo.order_id = lr.order_id
         LEFT JOIN lab_technicians lt ON lr.tech_id = lt.tech_id
         WHERE lo.record_id = ?`,
        [rec.record_id]
      );
      rec.labs = labs;
    }

    const [auditLogs] = await pool.query(
      'SELECT * FROM audit_logs ORDER BY logged_at DESC LIMIT 20'
    );

    res.json({ records, auditLogs });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load health wallet', error: err.message });
  }
});

module.exports = router;