const dotenv = require('dotenv');
dotenv.config();

// ─────────────────────────────────────────────────────────────────────────────
// PUBLIC API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extract entities and relationships from raw text.
 * Returns a graph-ready { nodes, edges } object.
 * @param {string} text - Raw input text to analyze
 * @returns {Promise<{ nodes: Array, edges: Array }>}
 */
async function extractGraphData(text) {
  const provider = (process.env.LLM_PROVIDER || 'groq').toLowerCase();

  const systemPrompt = `You are an expert NLP system specialized in Named Entity Recognition (NER) and Relationship Extraction.

Your task:
1. Read the provided text carefully.
2. Extract all meaningful named entities. Classify each as one of: PERSON, ORGANIZATION, LOCATION, EVENT, CONCEPT.
3. Extract meaningful relationships between pairs of entities. A relationship is a directed triplet: (source_entity) → [relationship_label] → (target_entity).
4. Return ONLY a valid JSON object. No markdown, no explanations, no code fences.

JSON Schema to return:
{
  "entities": [
    { "id": "unique_slug_id", "label": "Display Name", "type": "PERSON|ORGANIZATION|LOCATION|EVENT|CONCEPT", "description": "One brief sentence about this entity from the text" }
  ],
  "relationships": [
    { "source": "source_entity_id", "target": "target_entity_id", "relationship": "short relationship label" }
  ]
}

Rules:
- Entity IDs must be unique lowercase slugs (e.g. "elon_musk", "tesla_inc"). Use underscores, no spaces.
- Extract at minimum 3 entities and 2 relationships from any text.
- Relationships should be concise (2-5 words): "founded", "CEO of", "acquired", "located in", "led", "part of", "collaborated with".
- Only include entities that appear in the text. Do not invent entities.
- Do not include duplicate entities.`;

  try {
    let rawJson;
    if (provider === 'groq') {
      rawJson = await callGroqStructured(text, systemPrompt);
    } else if (provider === 'ollama') {
      rawJson = await callOllamaStructured(text, systemPrompt);
    } else {
      rawJson = getMockGraphData(text);
      return rawJson;
    }

    return parseGraphResponse(rawJson);
  } catch (err) {
    console.error('[LLM] extractGraphData error:', err.message);
    console.warn('[LLM] Falling back to mock graph data.');
    return getMockGraphData(text);
  }
}

/**
 * Legacy function kept for compatibility.
 * Generates a single coaching message string.
 * @param {string} prompt
 * @returns {Promise<string>}
 */
async function generateCoachMessage(prompt) {
  const provider = (process.env.LLM_PROVIDER || 'groq').toLowerCase();
  try {
    if (provider === 'groq') return await callGroqChat(prompt);
    if (provider === 'ollama') return await callOllamaChat(prompt);
    return 'Keep going — you have got this!';
  } catch (err) {
    console.error('[LLM] generateCoachMessage error:', err.message);
    return 'Keep going — you have got this!';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PRIVATE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function callGroqStructured(text, systemPrompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not defined');

  const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this text and extract the knowledge graph:\n\n${text}` }
      ],
      temperature: 0.1,
      max_tokens: 2048,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Groq API error ${response.status}: ${body}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function callGroqChat(prompt) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('GROQ_API_KEY not defined');

  const model = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 200
    })
  });

  if (!response.ok) throw new Error(`Groq API error ${response.status}`);
  const data = await response.json();
  return data.choices[0].message.content.trim();
}

async function callOllamaStructured(text, systemPrompt) {
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this text:\n\n${text}` }
      ],
      stream: false,
      format: 'json'
    })
  });

  if (!response.ok) throw new Error(`Ollama error ${response.status}`);
  const data = await response.json();
  return data.message.content;
}

async function callOllamaChat(prompt) {
  const model = process.env.OLLAMA_MODEL || 'llama3';
  const url = process.env.OLLAMA_URL || 'http://localhost:11434/api/chat';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model,
      messages: [{ role: 'user', content: prompt }],
      stream: false
    })
  });

  if (!response.ok) throw new Error(`Ollama error ${response.status}`);
  const data = await response.json();
  return data.message.content.trim();
}

/**
 * Parse and validate raw JSON string from LLM
 */
function parseGraphResponse(rawJson) {
  let parsed;
  try {
    parsed = typeof rawJson === 'string' ? JSON.parse(rawJson) : rawJson;
  } catch {
    // Sometimes the LLM wraps in markdown fences despite instructions
    const match = rawJson.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      parsed = JSON.parse(match[1].trim());
    } else {
      throw new Error('Could not parse LLM JSON response');
    }
  }

  const entities = Array.isArray(parsed.entities) ? parsed.entities : [];
  const relationships = Array.isArray(parsed.relationships) ? parsed.relationships : [];

  // Normalize to our schema format
  const nodes = entities.map(e => ({
    id: (e.id || e.label).toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
    label: e.label || e.id,
    type: ['PERSON', 'ORGANIZATION', 'LOCATION', 'EVENT', 'CONCEPT'].includes(e.type)
      ? e.type
      : 'CONCEPT',
    description: e.description || ''
  }));

  const validIds = new Set(nodes.map(n => n.id));
  const edges = relationships
    .filter(r => r.source && r.target && r.relationship)
    .map(r => ({
      source: r.source.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      target: r.target.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      relationship: r.relationship
    }))
    .filter(e => validIds.has(e.source) && validIds.has(e.target));

  return { nodes, edges };
}

/**
 * Mock graph data for offline testing
 */
function getMockGraphData(text) {
  return {
    nodes: [
      { id: 'elon_musk', label: 'Elon Musk', type: 'PERSON', description: 'Tech entrepreneur and CEO' },
      { id: 'tesla_inc', label: 'Tesla, Inc.', type: 'ORGANIZATION', description: 'Electric vehicle manufacturer' },
      { id: 'spacex', label: 'SpaceX', type: 'ORGANIZATION', description: 'Private space exploration company' },
      { id: 'silicon_valley', label: 'Silicon Valley', type: 'LOCATION', description: 'Technology hub in California' },
      { id: 'electric_vehicles', label: 'Electric Vehicles', type: 'CONCEPT', description: 'Battery-powered automobiles' }
    ],
    edges: [
      { source: 'elon_musk', target: 'tesla_inc', relationship: 'CEO of' },
      { source: 'elon_musk', target: 'spacex', relationship: 'founded' },
      { source: 'tesla_inc', target: 'silicon_valley', relationship: 'headquartered near' },
      { source: 'tesla_inc', target: 'electric_vehicles', relationship: 'manufactures' },
      { source: 'spacex', target: 'silicon_valley', relationship: 'based in' }
    ]
  };
}

module.exports = { extractGraphData, generateCoachMessage };
