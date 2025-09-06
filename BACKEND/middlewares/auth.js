const jwt = require('jsonwebtoken');
const ApiError = require('../utils/apiError');

exports.protect = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new ApiError(401, 'Not authorized');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    next(new ApiError(401, 'Not authorized'));
  }
};
