require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();
const allowedOrigins = new Set([
  process.env.FRONTEND_URL || 'https://school-fee-management-system-frontend.onrender.com',
  'http://localhost:5173'
]);

app.use(helmet());
app.disable('x-powered-by');
app.use(cors({
  origin: (origin, callback) => {
    callback(null, !origin || allowedOrigins.has(origin));
  }
}));
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'School Fee Management System API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

app.use(errorMiddleware);

module.exports = app;
