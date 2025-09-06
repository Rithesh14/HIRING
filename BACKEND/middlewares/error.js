const ApiError = require('../utils/apiError');

const errorHandler = (err, req, res, next) => {
  const error = { ...err };
  error.message = err.message;
  if (err.name === 'CastError') error.message = 'Resource not found';
  if (err.code === 11000) error.message = 'Duplicate field value entered';
  res.status(error.statusCode || 500).json({ success: false, message: error.message });
};

module.exports = errorHandler;
