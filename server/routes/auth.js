const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const {
    email,
    password,
    role,
    full_name,
    date_of_birth,
    gender,
    blood_group,
    phone,
    license_number,
    specialization,
    consultation_fee,
    lab_department,
    certification_id
  } = req.body;

  if (!email || !password || !role || !full_name) {
    return res.status(400).json({ message: 'Email, password, role, and full name are required.' });
  }

  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [userResult] = await connection.query(
      'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role]
    );
    const userId = userResult.insertId;

    if (role === 'PATIENT') {
      await connection.query(
        'INSERT INTO patients (patient_id, full_name, date_of_birth, gender, blood_group, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, full_name, date_of_birth, gender, blood_group, phone]
      );
    } else if (role === 'DOCTOR') {
      await connection.query(
        'INSERT INTO doctors (doctor_id, full_name, license_number, specialization, consultation_fee) VALUES (?, ?, ?, ?, ?)',
        [userId, full_name, license_number, specialization, consultation_fee]
      );
    } else if (role === 'LAB_TECH') {
      await connection.query(
        'INSERT INTO lab_technicians (tech_id, full_name, lab_department, certification_id) VALUES (?, ?, ?, ?)',
        [userId, full_name, lab_department, certification_id]
      );
    } else {
      throw new Error('Invalid role selected.');
    }

    await connection.commit();
    res.status(201).json({ message: 'Registration successful!', userId, role });
  } catch (err) {
    await connection.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email, license number, or certification ID already exists.' });
    }
    res.status(500).json({ message: 'Registration failed', error: err.message });
  } finally {
    connection.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const user = users[0];

    // Allow either real bcrypt hash OR 'password123' for the initial seeded sample accounts
    const isMatch =
      (await bcrypt.compare(password, user.password_hash)) ||
      (user.password_hash.startsWith('$2a$10$dummyhashfornow') && password === 'password123');

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    let profileName = user.email;
    if (user.role === 'PATIENT') {
      const [rows] = await pool.query('SELECT full_name FROM patients WHERE patient_id = ?', [user.user_id]);
      if (rows.length) profileName = rows[0].full_name;
    } else if (user.role === 'DOCTOR') {
      const [rows] = await pool.query('SELECT full_name FROM doctors WHERE doctor_id = ?', [user.user_id]);
      if (rows.length) profileName = rows[0].full_name;
    } else if (user.role === 'LAB_TECH') {
      const [rows] = await pool.query('SELECT full_name FROM lab_technicians WHERE tech_id = ?', [user.user_id]);
      if (rows.length) profileName = rows[0].full_name;
    }

    const token = jwt.sign(
      { userId: user.user_id, role: user.role, name: profileName },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        userId: user.user_id,
        email: user.email,
        role: user.role,
        name: profileName
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Login error', error: err.message });
  }
});

module.exports = router;