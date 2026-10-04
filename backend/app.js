require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authController = require('./controllers/authController');
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const feeRoutes = require('./routes/feeRoutes');
const searchRoutes = require('./routes/searchRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.disable('x-powered-by');
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.json({ message: 'School Fee Management System API is running' });
});

app.post('/api/login', authController.login);
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
