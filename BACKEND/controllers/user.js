const User = require('../models/user');
const ApiError = require('../utils/apiError');

// Get user progress
exports.getProgress = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('assessmentProgress');
    res.json({ success: true, progress: user.assessmentProgress });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Update user progress
exports.updateProgress = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { assessmentProgress: req.body }, { new: true });
    res.json({ success: true, progress: user.assessmentProgress });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};
