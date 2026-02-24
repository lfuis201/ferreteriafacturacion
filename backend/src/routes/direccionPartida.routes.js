const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/direccionPartida.controller');

// Rutas CRUD de Direcciones de Partida
router.get('/', ctrl.obtenerDireccionesPartida);
router.get('/buscar', ctrl.buscarDireccionesPartida);
router.get('/:id', ctrl.obtenerDireccionPartidaPorId);
router.post('/', ctrl.crearDireccionPartida);
router.put('/:id', ctrl.actualizarDireccionPartida);
router.delete('/:id', ctrl.eliminarDireccionPartida);

module.exports = router;