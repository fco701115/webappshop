const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDB } = require('./db');
const productsRouter = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.use('/api/products', productsRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/admin/stats', async (req, res) => {
  try {
    const { pool } = require('./db');
    const prodResult = await pool.query('SELECT COUNT(*) as count, AVG(price) as avg_price FROM products');
    const catResult = await pool.query('SELECT COUNT(*) as count FROM categories');
    res.json({
      totalProducts: parseInt(prodResult.rows[0].count),
      avgPrice: parseFloat(prodResult.rows[0].avg_price || 0),
      totalCategories: parseInt(catResult.rows[0].count),
    });
  } catch {
    const products = require('./src/js/data.js');
    res.json({
      totalProducts: 0,
      avgPrice: 0,
      totalCategories: 0,
      note: 'Database not available'
    });
  }
});

app.get('/admin*', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin', 'index.html'));
});

async function start() {
  try {
    await initDB();
    console.log('Database connected');
  } catch (err) {
    console.warn('Database not available, running in static mode:', err.message);
  }

  app.listen(PORT, () => {
    console.log(`TechStore server running at http://localhost:${PORT}`);
  });
}

start();
