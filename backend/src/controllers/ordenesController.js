const db = require('../db');

// POST /ordenes
async function crearOrden(req, res) {
  try {
    const { cliente_id, platillo_nombre } = req.body;
    if (!cliente_id || !platillo_nombre) {
      return res.status(400).json({ error: 'cliente_id y platillo_nombre son obligatorios' });
    }

    const insert =
      'INSERT INTO ordenes (cliente_id, platillo_nombre) VALUES ($1, $2) RETURNING id, cliente_id, platillo_nombre, estado, creado';
    const { rows } = await db.query(insert, [cliente_id, platillo_nombre]);
    return res.status(201).json({ message: 'Orden creada', orden: rows[0] });
  } catch (err) {
    // FK inválida u otro error
    if (err.code === '23503') {
      return res.status(400).json({ error: 'cliente_id no existe' });
    }
    console.error('crearOrden:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// GET /ordenes/:clienteId
async function listarOrdenesPorCliente(req, res) {
  try {
    const { clienteId } = req.params;
    const sel =
      'SELECT id, cliente_id, platillo_nombre, estado, creado FROM ordenes WHERE cliente_id = $1 ORDER BY creado DESC';
    const { rows } = await db.query(sel, [clienteId]);
    return res.json({ ordenes: rows });
  } catch (err) {
    console.error('listarOrdenesPorCliente:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

// PUT /ordenes/:id/estado  (avanza pending → preparing → delivered)
async function actualizarEstado(req, res) {
  try {
    const { id } = req.params;

    const get = 'SELECT estado FROM ordenes WHERE id = $1';
    const found = await db.query(get, [id]);
    if (found.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    const actual = (found.rows[0].estado || '').toLowerCase();
    let next = null;
    if (actual === 'pending') next = 'preparing';
    else if (actual === 'preparing') next = 'delivered';
    else if (actual === 'delivered') next = 'delivered'; // ya está finalizada
    else next = 'pending'; // valor de rescate

    const upd =
      'UPDATE ordenes SET estado = $2 WHERE id = $1 RETURNING id, cliente_id, platillo_nombre, estado, creado';
    const { rows } = await db.query(upd, [id, next]);

    return res.json({ message: 'Estado actualizado', orden: rows[0] });
  } catch (err) {
    console.error('actualizarEstado:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
}

module.exports = {
  crearOrden,
  listarOrdenesPorCliente,
  actualizarEstado,
};
