const express = require('express');
const { startAssessment, submitAssessment } = require('../controllers/assessments');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.use(protect);
router.post('/start', startAssessment);
router.post('/submit', submitAssessment);

module.exports = router;
