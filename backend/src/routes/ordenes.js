const express = require('express');
const router = express.Router();
const ordenesController = require('../controllers/ordenesController');

// Crear orden
router.post('/', ordenesController.crearOrden);

// Listar órdenes de un cliente
router.get('/:clienteId', ordenesController.listarOrdenesPorCliente);

// Actualizar estado de una orden
router.put('/:id/estado', ordenesController.actualizarEstado);

module.exports = router;
