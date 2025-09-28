const express = require('express');
const router = express.Router();
const clientesController = require('../controllers/clientesController');

router.post('/registrar', clientesController.registrarCliente);

router.post('/login', clientesController.loginCliente);

module.exports = router;
