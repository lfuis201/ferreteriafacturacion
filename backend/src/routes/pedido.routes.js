const express = require('express');
const router = express.Router();
const pedidoCtrl = require('../controllers/pedido.controller');

// GET /api/pedidos
router.get('/', pedidoCtrl.listarPedidos);

// POST /api/pedidos
router.post('/', pedidoCtrl.crearPedido);

// GET /api/pedidos/:id
router.get('/:id', pedidoCtrl.obtenerPedido);

module.exports = router;