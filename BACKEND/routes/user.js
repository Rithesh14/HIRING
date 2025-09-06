const express = require('express');
const { getProgress, updateProgress } = require('../controllers/users');
const { protect } = require('../middlewares/auth');
const router = express.Router();

router.use(protect);
router.get('/progress', getProgress);
router.put('/progress', updateProgress);

module.exports = router;
