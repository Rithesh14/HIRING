const Assessment = require('../models/Assessment');
const ApiError = require('../utils/apiError');

// Start assessment
exports.startAssessment = async (req, res, next) => {
  try {
    const { type, questions } = req.body;
    const assessment = await Assessment.create({ user: req.user.id, type, questions });
    res.status(201).json({ success: true, assessment });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};

// Submit assessment
exports.submitAssessment = async (req, res, next) => {
  try {
    const { assessmentId, answers } = req.body;
    const assessment = await Assessment.findById(assessmentId);
    if (!assessment) throw new ApiError(404, 'Assessment not found');
    assessment.answers = answers;
    assessment.status = 'completed';
    assessment.endTime = Date.now();
    await assessment.save();
    res.json({ success: true, assessment });
  } catch (error) {
    next(new ApiError(400, error.message));
  }
};
