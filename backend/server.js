const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
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
const db = new sqlite3.Database(dbPath);

// Create tables if they don't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS readings (
    id TEXT PRIMARY KEY,
    systolic INTEGER NOT NULL,
    diastolic INTEGER NOT NULL,
    heartRate INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    notes TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS cigars (
    id TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    brand TEXT,
    notes TEXT
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS drinks (
    id TEXT PRIMARY KEY,
    count INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    type TEXT,
    alcoholContent REAL,
    notes TEXT
  )`);
});

// API Routes
app.get('/api/readings', (req, res) => {
  db.all('SELECT * FROM readings ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/readings', (req, res) => {
  const { systolic, diastolic, heartRate, timestamp, notes } = req.body;
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
  
  db.run(
    'INSERT INTO readings (id, systolic, diastolic, heartRate, timestamp, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, systolic, diastolic, heartRate, timestamp, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, systolic, diastolic, heartRate, timestamp, notes });
    }
  );
});

app.put('/api/readings/:id', (req, res) => {
  const { id } = req.params;
  const { systolic, diastolic, heartRate, timestamp, notes } = req.body;
  
  db.run(
    'UPDATE readings SET systolic = ?, diastolic = ?, heartRate = ?, timestamp = ?, notes = ? WHERE id = ?',
    [systolic, diastolic, heartRate, timestamp, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, systolic, diastolic, heartRate, timestamp, notes });
    }
  );
});

app.delete('/api/readings/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM readings WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Cigar endpoints
app.get('/api/cigars', (req, res) => {
  db.all('SELECT * FROM cigars ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/cigars', (req, res) => {
  const { count, timestamp, brand, notes } = req.body;
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
  
  db.run(
    'INSERT INTO cigars (id, count, timestamp, brand, notes) VALUES (?, ?, ?, ?, ?)',
    [id, count, timestamp, brand, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, count, timestamp, brand, notes });
    }
  );
});

app.put('/api/cigars/:id', (req, res) => {
  const { id } = req.params;
  const { count, timestamp, brand, notes } = req.body;
  
  db.run(
    'UPDATE cigars SET count = ?, timestamp = ?, brand = ?, notes = ? WHERE id = ?',
    [count, timestamp, brand, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, count, timestamp, brand, notes });
    }
  );
});

app.delete('/api/cigars/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM cigars WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Drink endpoints
app.get('/api/drinks', (req, res) => {
  db.all('SELECT * FROM drinks ORDER BY timestamp DESC', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

app.post('/api/drinks', (req, res) => {
  const { count, timestamp, type, alcoholContent, notes } = req.body;
  const id = Date.now().toString() + Math.random().toString(36).substring(2, 11);
  
  db.run(
    'INSERT INTO drinks (id, count, timestamp, type, alcoholContent, notes) VALUES (?, ?, ?, ?, ?, ?)',
    [id, count, timestamp, type, alcoholContent, notes],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, count, timestamp, type, alcoholContent, notes });
    }
  );
});

app.put('/api/drinks/:id', (req, res) => {
  const { id } = req.params;
  const { count, timestamp, type, alcoholContent, notes } = req.body;
  
  db.run(
    'UPDATE drinks SET count = ?, timestamp = ?, type = ?, alcoholContent = ?, notes = ? WHERE id = ?',
    [count, timestamp, type, alcoholContent, notes, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json({ id, count, timestamp, type, alcoholContent, notes });
    }
  );
});

app.delete('/api/drinks/:id', (req, res) => {
  const { id } = req.params;
  
  db.run('DELETE FROM drinks WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json({ success: true });
  });
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api`);
});
