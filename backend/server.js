const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const AIAnalysisService = require('./services/aiAnalysisService');

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize AI Analysis Service
const aiAnalysisService = new AIAnalysisService();

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
const resolveDbPath = () => {
  if (process.env.BP_DB_PATH) {
    return process.env.BP_DB_PATH;
  }

  if (process.env.NODE_ENV === 'production') {
    return '/app/data/bloodpressure.db';
  }

  const dataDir = path.resolve(__dirname, '../data');
  const dataDbPath = path.join(dataDir, 'bloodpressure.db');
  if (fs.existsSync(dataDbPath)) {
    return dataDbPath;
  }

  return path.resolve(__dirname, './bloodpressure.db');
};

const dbPath = resolveDbPath();

// Ensure the directory exists for non-root paths
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
console.log(`Using database at ${dbPath}`);

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

db.exec(`CREATE TABLE IF NOT EXISTS cardio (
  id TEXT PRIMARY KEY,
  activity TEXT NOT NULL,
  minutes INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  notes TEXT
)`);

db.exec(`CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  timestamp TEXT NOT NULL
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

const getCardio = db.prepare('SELECT * FROM cardio ORDER BY timestamp DESC');
const insertCardio = db.prepare('INSERT INTO cardio (id, activity, minutes, timestamp, notes) VALUES (?, ?, ?, ?, ?)');
const updateCardio = db.prepare('UPDATE cardio SET activity = ?, minutes = ?, timestamp = ?, notes = ? WHERE id = ?');
const deleteCardio = db.prepare('DELETE FROM cardio WHERE id = ?');

const getEvents = db.prepare('SELECT * FROM events ORDER BY timestamp DESC');
const insertEvent = db.prepare('INSERT INTO events (id, title, description, timestamp) VALUES (?, ?, ?, ?)');
const updateEvent = db.prepare('UPDATE events SET title = ?, description = ?, timestamp = ? WHERE id = ?');
const deleteEvent = db.prepare('DELETE FROM events WHERE id = ?');

const getSetting = db.prepare('SELECT value FROM settings WHERE key = ?');
const setSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES (?, ?, ?)');

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

// Cardio endpoints
app.get('/api/cardio', (req, res) => {
  try {
    const rows = getCardio.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/cardio', (req, res) => {
  try {
    const { activity, minutes, timestamp, notes } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);

    insertCardio.run(id, activity, minutes, timestamp, notes);
    res.json({ id, activity, minutes, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/cardio/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { activity, minutes, timestamp, notes } = req.body;

    updateCardio.run(activity, minutes, timestamp, notes, id);
    res.json({ id, activity, minutes, timestamp, notes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/cardio/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteCardio.run(id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Singular event endpoints
app.get('/api/events', (req, res) => {
  try {
    const rows = getEvents.all();
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/events', (req, res) => {
  try {
    const { title, description, timestamp } = req.body;
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);

    insertEvent.run(id, title, description, timestamp);
    res.json({ id, title, description, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, timestamp } = req.body;

    updateEvent.run(title, description, timestamp, id);
    res.json({ id, title, description, timestamp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/events/:id', (req, res) => {
  try {
    const { id } = req.params;
    deleteEvent.run(id);
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

    const cardioEntries = getCardio.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    const eventEntries = getEvents.all().map(row => ({
      ...row,
      timestamp: new Date(row.timestamp)
    }));

    console.log(`Found ${cigarEntries.length} cigar entries, ${drinkEntries.length} drink entries, ${weightEntries.length} weight entries, ${cardioEntries.length} cardio entries`);

    const analysis = await aiAnalysisService.generateAdvancedAnalysis(
      readings, 
      cigarEntries, 
      drinkEntries,
      weightEntries,
      cardioEntries,
      eventEntries
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

// Health check endpoint for analysis service
app.get('/api/analysis/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'Analysis Service',
    aiFeaturesEnabled: false,
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

    const analysis = await aiAnalysisService.generateAdvancedAnalysis(testReadings, [], [], [], [], []);
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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});