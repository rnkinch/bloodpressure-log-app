const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

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

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});