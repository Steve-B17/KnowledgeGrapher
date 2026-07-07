const mongoose = require('mongoose');

const NodeSchema = new mongoose.Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: {
    type: String,
    enum: ['PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'CONCEPT'],
    default: 'CONCEPT'
  },
  description: { type: String, default: '' }
}, { _id: false });

const EdgeSchema = new mongoose.Schema({
  source: { type: String, required: true },
  target: { type: String, required: true },
  relationship: { type: String, required: true }
}, { _id: false });

const AnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    default: 'Untitled Analysis'
  },
  inputText: {
    type: String,
    required: true,
    maxlength: 8000
  },
  nodes: [NodeSchema],
  edges: [EdgeSchema],
  entityCount: { type: Number, default: 0 },
  edgeCount: { type: Number, default: 0 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Analysis', AnalysisSchema);
