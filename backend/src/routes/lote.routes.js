const express = require('express');
const router = express.Router();

const loteCtrl = require('../controllers/lote.controller');

// Rutas CRUD de lotes
router.get('/', loteCtrl.listarLotes);
router.get('/:id', loteCtrl.obtenerLote);
router.post('/', loteCtrl.crearLote);
router.put('/:id', loteCtrl.actualizarLote);
router.delete('/:id', loteCtrl.eliminarLote);

module.exports = router;