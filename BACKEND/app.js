const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const path = require('path');
const errorHandler = require('./middlewares/error');

// Route files
const auth = require('./routes/auth');
const assessments = require('./routes/assessments');
const users = require('./routes/users');
const analytics = require('./routes/analytics');

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Sanitize data
app.use(mongoSanitize());

// Prevent XSS attacks
app.use(xss());

// Prevent parameter pollution
app.use(hpp());

// Set security headers
app.use(helmet());

// Enable CORS
app.use(cors());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 10 * 60 * 1000, // 10 minutes
  max: process.env.RATE_LIMIT_MAX || 100, // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Compress responses
app.use(compression());

// Mount routers
app.use('/api/auth', auth);
app.use('/api/assessments', assessments);
app.use('/api/users', users);
app.use('/api/analytics', analytics);

// Error handling middleware
app.use(errorHandler);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend/build', 'index.html'));
  });
}

// Handle undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

module.exports = app;
