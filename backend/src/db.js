const { Pool } = require('pg');
require('dotenv').config();

const isRenderUrl = !!process.env.DATABASE_URL;

// Cuando Render te da DATABASE_URL, usa SSL obligatorio.
// Si trabajas local, usa variables PGHOST/PGPORT/PGUSER/PGPASSWORD/PGDATABASE.
const pool = isRenderUrl
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    })
  : new Pool({
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'restaurante_ordenes_db',
      ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false,
    });

// Probar conexión al inicio (log no bloqueante)
pool
  .query('SELECT NOW()')
  .then((r) => console.log('DB conectada:', r.rows[0].now))
  .catch((e) => console.error('Error conectando a DB:', e.message));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};
