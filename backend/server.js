const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');
const AIAnalysisService = require('./services/aiAnalysisService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI Analysis Service
const aiAnalysisService = new AIAnalysisService();

// Load model preferences from database on startup
const loadModelPreferences = () => {
  try {
    const modelResult = getSetting.get('huggingface_model');
    // Only use stored model if it's a valid one, otherwise use gpt2
    const validModels = ['gpt2', 'distilgpt2', 'microsoft/DialoGPT-small', 'distilbert-base-uncased'];
    if (modelResult && validModels.includes(modelResult.value)) {
      aiAnalysisService.huggingFaceService.setSelectedModel(modelResult.value);
      console.log('Loaded valid model preference:', modelResult.value);
    } else {
      aiAnalysisService.huggingFaceService.setSelectedModel('gpt2');
      console.log('Using default model: gpt2');
    }
  } catch (error) {
    console.error('Error loading model preferences:', error);
    aiAnalysisService.huggingFaceService.setSelectedModel('gpt2');
    console.log('Using default model due to error: gpt2');
  }
};

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Disable caching for API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

app.use(express.static(path.join(__dirname, '../build')));

// Database setup
const dbPath = process.env.NODE_ENV === 'production' 
  ? '/app/data/bloodpressure.db' 
  : './bloodpressure.db';
const db = new Database(dbPath);

// Create tables if they don't exist
db.exec(`CREATE TABLE IF NOT EXISTS readings (
  id TEXT PRIMARY KEY,
  systolic INTEGER NOT NULL,
  diastolic INTEGER NOT NULL,
  heartRate INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  notes TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS cigars (
  id TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  brand TEXT,
  notes TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS drinks (
  id TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  type TEXT,
  alcoholContent REAL,
  notes TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS weights (
  id TEXT PRIMARY KEY,
  weight REAL NOT NULL,
  timestamp TEXT NOT NULL,
  notes TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)`);

// Prepare statements for better performance
const getReadings = db.prepare('SELECT * FROM readings ORDER BY timestamp DESC');
const insertReading = db.prepare('INSERT INTO readings (id, systolic, diastolic, heartRate, timestamp, notes) VALUES (?, ?, ?, ?, ?, ?)');
const updateReading = db.prepare('UPDATE readings SET systolic = ?, diastolic = ?, heartRate = ?, timestamp = ?, notes = ? WHERE id = ?');
const deleteReading = db.prepare('DELETE FROM readings WHERE id = ?');

const getCigars = db.prepare('SELECT * FROM cigars ORDER BY timestamp DESC');
const insertCigar = db.prepare('INSERT INTO cigars (id, count, timestamp, brand, notes) VALUES (?, ?, ?, ?, ?)');
const updateCigar = db.prepare('UPDATE cigars SET count = ?, timestamp = ?, brand = ?, notes = ? WHERE id = ?');
const deleteCigar = db.prepare('DELETE FROM cigars WHERE id = ?');

const getDrinks = db.prepare('SELECT * FROM drinks ORDER BY timestamp DESC');
const insertDrink = db.prepare('INSERT INTO drinks (id, count, timestamp, type, alcoholContent, notes) VALUES (?, ?, ?, ?, ?, ?)');
const updateDrink = db.prepare('UPDATE drinks SET count = ?, timestamp = ?, type = ?, alcoholContent = ?, notes = ? WHERE id = ?');
const deleteDrink = db.prepare('DELETE FROM drinks WHERE id = ?');

const getWeights = db.prepare('SELECT * FROM weights ORDER BY timestamp DESC');
const insertWeight = db.prepare('INSERT INTO weights (id, weight, timestamp, notes) VALUES (?, ?, ?, ?)');
const updateWeight = db.prepare('UPDATE weights SET weight = ?, timestamp = ?, notes = ? WHERE id = ?');
const deleteWeight = db.prepare('DELETE FROM weights WHERE id = ?');

const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');

// Load model preferences after database is ready
loadModelPreferences();

// API Routes
app.get('/api/readings', (req, res) => {
  try {
    const rows = getReadings.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/readings', (req, res) => {
  try {
    const { systolic, diastolic, heartRate, timestamp, notes } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    
    insertReading.run(id, systolic, diastolic, heartRate, timestamp, notes);
    res.json({ id, systolic, diastolic, heartRate, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/readings/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { systolic, diastolic, heartRate, timestamp, notes } = req.body;
    
    updateReading.run(systolic, diastolic, heartRate, timestamp, notes, id);
    res.json({ id, systolic, diastolic, heartRate, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/readings/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteReading.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Cigar endpoints
app.get('/api/cigars', (req, res) => {
  try {
    const rows = getCigars.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cigars', (req, res) => {
  try {
    const { count, timestamp, brand, notes } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    
    insertCigar.run(id, count, timestamp, brand, notes);
    res.json({ id, count, timestamp, brand, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cigars/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { count, timestamp, brand, notes } = req.body;
    
    updateCigar.run(count, timestamp, brand, notes, id);
    res.json({ id, count, timestamp, brand, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cigars/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteCigar.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Drink endpoints
app.get('/api/drinks', (req, res) => {
  try {
    const rows = getDrinks.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/drinks', (req, res) => {
  try {
    const { count, timestamp, type, alcoholContent, notes } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    
    insertDrink.run(id, count, timestamp, type, alcoholContent, notes);
    res.json({ id, count, timestamp, type, alcoholContent, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/drinks/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { count, timestamp, type, alcoholContent, notes } = req.body;
    
    updateDrink.run(count, timestamp, type, alcoholContent, notes, id);
    res.json({ id, count, timestamp, type, alcoholContent, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/drinks/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteDrink.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weight endpoints
app.get('/api/weights', (req, res) => {
  try {
    const rows = getWeights.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/weights', (req, res) => {
  try {
    const { weight, timestamp, notes } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
    
    insertWeight.run(id, weight, timestamp, notes);
    res.json({ id, weight, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/weights/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { weight, timestamp, notes } = req.body;
    
    updateWeight.run(weight, timestamp, notes, id);
    res.json({ id, weight, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/weights/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteWeight.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Settings endpoints
app.get('/api/settings/:key', (req, res) => {
  try {
    const { key } = req.params;
    const result = getSetting.get(key);
    res.json({ key, value: result ? result.value : null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings', (req, res) => {
  try {
    const { key, value } = req.body;
    const timestamp = new Date().toISOString();
    setSetting.run(key, value, timestamp);
    res.json({ key, value, updated_at: timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// AI Analysis endpoint
app.get('/api/analysis/advanced', async (req, res) => {
  try {
    console.log('AI Analysis endpoint called');
    
    const readings = getReadings.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    console.log(`Found ${readings.length} readings`);
    
    const cigarEntries = getCigars.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const drinkEntries = getDrinks.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const weightEntries = getWeights.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    console.log(`Found ${cigarEntries.length} cigar entries, ${drinkEntries.length} drink entries, ${weightEntries.length} weight entries`);

    const analysis = await aiAnalysisService.generateAdvancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries
    );

    console.log('Analysis generated successfully');
    res.json(analysis);
  } catch (err) {
    console.error('AI Analysis error:', err);
    console.error('Error stack:', err.stack);
    res.status(500).json({ 
      error: 'Failed to generate AI analysis', 
      details: err.message,
      stack: err.stack
    });
  }
});

// Enhanced AI Analysis endpoint with Hugging Face
app.get('/api/analysis/enhanced', async (req, res) => {
  try {
    console.log('Enhanced AI Analysis endpoint called');
    
    // Load API key and model preference from database
    const apiKeyResult = getSetting.get('huggingface_api_key');
    if (apiKeyResult) {
      aiAnalysisService.huggingFaceService.setApiKey(apiKeyResult.value);
    }
    
    const modelResult = getSetting.get('huggingface_model');
    if (modelResult) {
      aiAnalysisService.huggingFaceService.setSelectedModel(modelResult.value);
    }
    
    const readings = getReadings.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const cigarEntries = getCigars.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const drinkEntries = getDrinks.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const weightEntries = getWeights.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    const enhancedAnalysis = await aiAnalysisService.generateEnhancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries
    );

    console.log('Enhanced analysis generated successfully');
    res.json(enhancedAnalysis);
  } catch (err) {
    console.error('Enhanced AI Analysis error:', err);
    res.status(500).json({ 
      error: 'Failed to generate enhanced AI analysis', 
      details: err.message
    });
  }
});

// Enhanced AI Analysis endpoint with API key from frontend
app.post('/api/analysis/enhanced', async (req, res) => {
  try {
    console.log('Enhanced AI Analysis endpoint called with API key');
    
    const { apiKey } = req.body;
    
    // Set the API key and model preference for this request
    if (apiKey) {
      aiAnalysisService.huggingFaceService.setApiKey(apiKey);
    }
    
    // Load model preference from database (validate it's a valid model)
    const modelResult = getSetting.get('huggingface_model');
    const validModels = ['gpt2', 'distilgpt2', 'microsoft/DialoGPT-small', 'distilbert-base-uncased'];
    if (modelResult && validModels.includes(modelResult.value)) {
      aiAnalysisService.huggingFaceService.setSelectedModel(modelResult.value);
    } else {
      aiAnalysisService.huggingFaceService.setSelectedModel('gpt2');
    }
    
    const readings = getReadings.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const cigarEntries = getCigars.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const drinkEntries = getDrinks.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const weightEntries = getWeights.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    const enhancedAnalysis = await aiAnalysisService.generateEnhancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries
    );

    console.log('Enhanced analysis generated successfully');
    res.json(enhancedAnalysis);
  } catch (err) {
    console.error('Enhanced AI Analysis error:', err);
    res.status(500).json({ 
      error: 'Failed to generate enhanced AI analysis', 
      details: err.message
    });
  }
});

// AI Q&A endpoint
app.post('/api/analysis/ask', async (req, res) => {
  try {
    const { question, apiKey } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    // Set the API key and model preference for this request
    if (apiKey) {
      aiAnalysisService.huggingFaceService.setApiKey(apiKey);
    }
    
    // Load model preference from database (validate it's a valid model)
    const modelResult = getSetting.get('huggingface_model');
    const validModels = ['gpt2', 'distilgpt2', 'microsoft/DialoGPT-small', 'distilbert-base-uncased'];
    if (modelResult && validModels.includes(modelResult.value)) {
      aiAnalysisService.huggingFaceService.setSelectedModel(modelResult.value);
    } else {
      aiAnalysisService.huggingFaceService.setSelectedModel('gpt2');
    }

    console.log('AI Q&A endpoint called with question:', question);
    
    const readings = getReadings.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const cigarEntries = getCigars.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const drinkEntries = getDrinks.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const weightEntries = getWeights.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    const answer = await aiAnalysisService.answerUserQuestion(
      question,
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries
    );

    console.log('AI Q&A response generated successfully');
    res.json(answer);
  } catch (err) {
    console.error('AI Q&A error:', err);
    res.status(500).json({ 
      error: 'Failed to process question', 
      details: err.message
    });
  }
});

// Health Report endpoint
app.get('/api/analysis/report', async (req, res) => {
  try {
    console.log('Health Report endpoint called');
    
    const readings = getReadings.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const cigarEntries = getCigars.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const drinkEntries = getDrinks.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));
    
    const weightEntries = getWeights.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    const report = await aiAnalysisService.generateHealthReport(
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries
    );

    console.log('Health report generated successfully');
    res.json(report);
  } catch (err) {
    console.error('Health Report error:', err);
    res.status(500).json({ 
      error: 'Failed to generate health report', 
      details: err.message
    });
  }
});

// Health check endpoint for AI service
app.get('/api/analysis/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'AI Analysis Service',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to test AI service
app.get('/api/analysis/debug', async (req, res) => {
  try {
    const testReadings = [
      {
        id: '1',
        systolic: 120,
        diastolic: 80,
        heartRate: 72,
        timestamp: new Date('2024-01-01T08:00:00Z')
      },
      {
        id: '2',
        systolic: 125,
        diastolic: 82,
        heartRate: 75,
        timestamp: new Date('2024-01-02T08:00:00Z')
      }
    ];

    const analysis = await aiAnalysisService.generateAdvancedAnalysis(testReadings, [], []);
    res.json({ 
      status: 'success', 
      message: 'AI service working',
      analysis: {
        riskAssessment: analysis.riskAssessment?.overall || 'N/A',
        dataQuality: analysis.dataQuality?.quality || 'N/A',
        confidenceScore: analysis.confidenceScore || 'N/A'
      }
    });
  } catch (error) {
    console.error('AI Debug Error:', error);
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      stack: error.stack
    });
  }
});

// API key validation endpoint
app.post('/api/analysis/test-key', async (req, res) => {
  console.log('API key validation request received');
  const { apiKey, model } = req.body;
  console.log('API key received:', apiKey ? 'present' : 'missing');
  console.log('Model received:', model || 'default');
  
  if (!apiKey) {
    console.log('No API key provided');
    return res.status(400).json({ valid: false, error: 'API key is required' });
  }

  // Validate API key format first
  if (!apiKey.startsWith('hf_') || apiKey.length < 20) {
    console.log('Invalid API key format');
    return res.json({ valid: false, error: 'Invalid API key format. Hugging Face keys start with "hf_" and are longer.' });
  }

  try {
    // Set the API key on the service
    console.log('API key before setting:', apiKey ? 'present' : 'missing', apiKey ? apiKey.substring(0, 5) + '...' : '');
    aiAnalysisService.huggingFaceService.setApiKey(apiKey);
    
    // Test the API key by making a real request to HuggingFace
    // Use a simple text classification model that's known to work with the Inference API
    const testModel = 'distilbert-base-uncased-finetuned-sst-2-english';
    console.log(`Testing API key with model: ${testModel}`);
    
    // Use the service's method to make the API call
    const result = await aiAnalysisService.huggingFaceService.callHuggingFaceAPI("I love this product!", testModel);

    console.log('API key validation successful');
    console.log('Response:', result);
    
    return res.json({ 
      valid: true, 
      message: 'API key is valid and working! You can now use enhanced AI features.',
      model: testModel,
      responseTime: 'API responded successfully'
    });

  } catch (error) {
    console.error('API key validation failed:', error.message);
    
    if (error.response) {
      console.error('API Response Status:', error.response.status);
      console.error('API Response Data:', error.response.data);
      
      if (error.response.status === 401) {
        return res.json({ valid: false, error: 'Invalid API key. Please check your HuggingFace token.' });
      } else if (error.response.status === 503) {
        return res.json({ valid: false, error: 'Model is currently loading. Please try again in a moment.' });
      } else if (error.response.status === 429) {
        return res.json({ valid: false, error: 'Rate limit exceeded. Please try again later.' });
      } else {
        return res.json({ valid: false, error: `API error: ${error.response.status} - ${error.response.data?.error || 'Unknown error'}` });
      }
    } else if (error.code === 'ECONNABORTED') {
      return res.json({ valid: false, error: 'Request timeout. The model may be loading - this can take up to 60 seconds.' });
    } else {
      return res.json({ valid: false, error: `Connection error: ${error.message}` });
    }
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Direct HuggingFace verification endpoint
app.post('/api/analysis/verify-hf', async (req, res) => {
  try {
    const { apiKey, model = 'gpt2', text = 'Hello, world!' } = req.body;
    
    if (!apiKey) {
      return res.status(400).json({ error: 'API key is required' });
    }
    
    console.log(`Making direct HuggingFace API call to model: ${model}`);
    console.log(`API key (first 5 chars): ${apiKey.substring(0, 5)}...`);
    
    const startTime = Date.now();
    
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${model}`,
      { inputs: text },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );
    
    const endTime = Date.now();
    
    console.log(`Direct HuggingFace API call succeeded in ${endTime - startTime}ms`);
    console.log(`Status code: ${response.status}`);
    console.log(`Response headers:`, response.headers);
    
    // Return full response details for verification
    return res.json({
      success: true,
      responseTime: endTime - startTime,
      statusCode: response.status,
      headers: response.headers,
      data: response.data,
      model: model,
      requestId: response.headers['x-request-id'] || 'unknown'
    });
  } catch (error) {
    console.error('Direct HuggingFace API call failed:', error.message);
    
    // Return detailed error information
    return res.status(500).json({
      success: false,
      error: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: error.response?.headers
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});