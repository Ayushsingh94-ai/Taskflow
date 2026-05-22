const express = require('express');
const router = express.Router();
const { submitReport, getReports, getReportsByTask } = require('../controllers/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.post('/', protect, submitReport);
router.get('/', protect, getReports);
router.get('/task/:taskId', protect, adminOnly, getReportsByTask);

module.exports = router;