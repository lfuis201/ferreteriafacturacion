const express = require('express');
const router = express.Router();

const liquidacionCtrl = require('../controllers/liquidacionCompra.controller');

// Listar con filtros
router.get('/', liquidacionCtrl.obtenerLiquidaciones);
// Buscar atajo
router.get('/buscar', liquidacionCtrl.buscarLiquidaciones);
// Obtener por ID
router.get('/:id', liquidacionCtrl.obtenerLiquidacionPorId);
// Crear
router.post('/', liquidacionCtrl.crearLiquidacion);
// Actualizar
router.put('/:id', liquidacionCtrl.actualizarLiquidacion);
// Eliminar
router.delete('/:id', liquidacionCtrl.eliminarLiquidacion);

module.exports = router;