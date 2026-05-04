const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '5mb' }));


const URI = process.env.MONGO_URI;
const DB = 'manpower';
let db;

if (!URI) {
  console.error('MONGO_URI environment variable is not set!');
  process.exit(1);
}

MongoClient.connect(URI, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000
}).then(client => {
  db = client.db(DB);
  console.log('MongoDB connected successfully');
}).catch(err => {
  console.error('MongoDB connection error:', err.message);
  process.exit(1);
});
// POST — save records
app.post('/api/:collection', async (req, res) => {
  try {
    const col = db.collection(req.params.collection);
    const data = req.body;
    if (Array.isArray(data) && data.length) await col.insertMany(data);
    else if (!Array.isArray(data)) await col.insertOne(data);
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET — load records by date
app.get('/api/:collection', async (req, res) => {
  try {
    const col = db.collection(req.params.collection);
    const query = req.query.date ? { date: req.query.date } : {};
    const docs = await col.find(query).toArray();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// DELETE — delete records by date
app.delete('/api/:collection', async (req, res) => {
  try {
    const col = db.collection(req.params.collection);
    const result = await col.deleteMany({ date: req.query.date });
    res.json({ deleted: result.deletedCount });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('API running on port', PORT));
