const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const AIAnalysisService = require('./services/aiAnalysisService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI Analysis Service
const aiAnalysisService = new AIAnalysisService();

// Middleware
app.use(cors());
app.use(bodyParser.json());
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

    console.log(`Found ${cigarEntries.length} cigar entries, ${drinkEntries.length} drink entries`);

    const analysis = await aiAnalysisService.generateAdvancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries
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

    const enhancedAnalysis = await aiAnalysisService.generateEnhancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries
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
    
    // Set the API key for this request
    if (apiKey) {
      aiAnalysisService.huggingFaceService.setApiKey(apiKey);
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

    const enhancedAnalysis = await aiAnalysisService.generateEnhancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries
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

    // Set the API key for this request
    if (apiKey) {
      aiAnalysisService.huggingFaceService.setApiKey(apiKey);
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

    const answer = await aiAnalysisService.answerUserQuestion(
      question,
      readings, 
      cigarEntries, 
      drinkEntries
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

    const report = await aiAnalysisService.generateHealthReport(
      readings, 
      cigarEntries, 
      drinkEntries
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
app.post('/api/analysis/test-key', (req, res) => {
  console.log('API key validation request received');
  const { apiKey } = req.body;
  console.log('API key received:', apiKey ? 'present' : 'missing');
  
  if (!apiKey) {
    console.log('No API key provided');
    return res.status(400).json({ valid: false, error: 'API key is required' });
  }

  // Validate API key format first
  if (!apiKey.startsWith('hf_') || apiKey.length < 20) {
    console.log('Invalid API key format');
    return res.json({ valid: false, error: 'Invalid API key format. Hugging Face keys start with "hf_" and are longer.' });
  }

  // For now, just validate the format - the actual API will be tested when used
  console.log('API key format is valid');
  return res.json({ valid: true, message: 'API key format is valid. You can now use enhanced AI features!' });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});