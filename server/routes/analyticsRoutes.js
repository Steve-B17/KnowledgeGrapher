const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Get statistics summary (secured)
router.get('/summary', authMiddleware, analyticsController.getAnalyticsSummary);

module.exports = router;
