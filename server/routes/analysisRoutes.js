const express = require('express');
const router = express.Router();
const analysisController = require('../controllers/analysisController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.post('/analyze', analysisController.analyzeText);
router.get('/history', analysisController.getHistory);
router.get('/:id', analysisController.getAnalysis);
router.delete('/:id', analysisController.deleteAnalysis);

module.exports = router;
