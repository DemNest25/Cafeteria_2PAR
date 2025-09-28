const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const clientesRoutes = require('./routes/clientes');
const ordenesRoutes = require('./routes/ordenes');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

// ===== RUTAS API =====
app.use('/clientes', clientesRoutes);
app.use('/ordenes', ordenesRoutes);

// Healthcheck
app.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ ok: true, db: 'up', api: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', api: 'up', error: e.message });
  }
});

// ===== FRONTEND =====
const frontDir = path.join(__dirname, '../../frontend');
app.use(express.static(frontDir));

// Catch-all → servir index.html (excepto rutas API/health)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/clientes') || req.path.startsWith('/ordenes') || req.path.startsWith('/health')) {
    return next();
  }
  res.sendFile(path.join(frontDir, 'index.html'));
});

// ===== ARRANQUE =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en puerto ${PORT}`);
});

module.exports = app;
