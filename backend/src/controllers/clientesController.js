const db = require('../db');

// POST /clientes/registrar
async function registrarCliente(req, res) {
  try {
    const { nombre, email, telefono } = req.body;
    if (!nombre || !email || !telefono) {
      return res.status(400).json({ error: 'nombre, email y telefono son obligatorios' });
    }

    const insert =
      'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING id, nombre, email, telefono';
    const { rows } = await db.query(insert, [nombre, email, telefono]);
    return res.status(201).json({ message: 'Cliente registrado', cliente: rows[0] });
  } catch (err) {
    // Violación de unique (email)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error('registrarCliente:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// POST /clientes/login
async function loginCliente(req, res) {
  try {
    const { email, telefono } = req.body;
    if (!email || !telefono) {
      return res.status(400).json({ error: 'email y telefono son obligatorios' });
    }

    const sel =
      'SELECT id, nombre, email, telefono FROM clientes WHERE email = $1 AND telefono = $2';
    const { rows } = await db.query(sel, [email, telefono]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    return res.json({ message: 'Login exitoso', cliente: rows[0] });
  } catch (err) {
    console.error('loginCliente:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = {
  registrarCliente,
  loginCliente,
};
