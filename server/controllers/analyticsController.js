const { getUserAnalytics } = require('../services/analyticsService');

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const stats = await getUserAnalytics(req.userId);
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error generating analytics summary' });
  }
};
