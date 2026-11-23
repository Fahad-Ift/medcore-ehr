const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const appointmentRoutes = require('./routes/appointments');
const recordRoutes = require('./routes/records');
const labRoutes = require('./routes/labs');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected to MySQL medcore_ehr' });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', error: err.message });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/records', recordRoutes);
app.use('/api/labs', labRoutes);

if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`MedCore EHR Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;