require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const { PORT = 4000, MONGO_URI = 'mongodb://localhost:27017/react-crud' } = process.env;

// health first so we can always check
app.get('/health', (_req, res) => res.json({ ok: true }));

// --- ROUTES ---
const inventoryRoutes = require('./routes/inventories');
app.use('/api/inventories', inventoryRoutes);
// -------------


// connect DB and start server
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
