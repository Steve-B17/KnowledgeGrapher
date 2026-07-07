const Analysis = require('../models/Analysis');
const { extractGraphData } = require('../services/llmProvider');

// ── POST /api/analysis/analyze ──────────────────────────────────────────────
exports.analyzeText = async (req, res) => {
  const { text, title } = req.body;

  if (!text || text.trim().length < 50) {
    return res.status(400).json({
      message: 'Please provide at least 50 characters of text to analyze.'
    });
  }

  if (text.length > 8000) {
    return res.status(400).json({
      message: 'Text too long. Maximum 8000 characters allowed.'
    });
  }

  try {
    console.log(`[Analysis] Starting NLP extraction for user ${req.userId}...`);
    const { nodes, edges } = await extractGraphData(text);

    if (!nodes || nodes.length === 0) {
      return res.status(422).json({
        message: 'Could not extract any entities from the provided text. Try a more descriptive passage.'
      });
    }

    // Auto-generate title from first 60 chars of text if not provided
    const autoTitle = title?.trim() ||
      text.trim().replace(/\s+/g, ' ').substring(0, 60) + (text.length > 60 ? '…' : '');

    const analysis = new Analysis({
      userId: req.userId,
      title: autoTitle,
      inputText: text,
      nodes,
      edges,
      entityCount: nodes.length,
      edgeCount: edges.length
    });

    await analysis.save();

    console.log(`[Analysis] Saved: ${nodes.length} entities, ${edges.length} relationships.`);
    res.status(201).json(analysis);
  } catch (err) {
    console.error('[Analysis] Error:', err);
    res.status(500).json({ message: 'Server error during NLP analysis.' });
  }
};

// ── GET /api/analysis/history ────────────────────────────────────────────────
exports.getHistory = async (req, res) => {
  try {
    const history = await Analysis.find({ userId: req.userId })
      .select('title entityCount edgeCount createdAt')
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(history);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching history.' });
  }
};

// ── GET /api/analysis/:id ────────────────────────────────────────────────────
exports.getAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found.' });
    }
    res.json(analysis);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error fetching analysis.' });
  }
};

// ── DELETE /api/analysis/:id ─────────────────────────────────────────────────
exports.deleteAnalysis = async (req, res) => {
  try {
    const analysis = await Analysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    if (!analysis) {
      return res.status(404).json({ message: 'Analysis not found.' });
    }
    res.json({ message: 'Analysis deleted successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error deleting analysis.' });
  }
};
