const express = require('express');
const router = express.Router();

const serieCtrl = require('../controllers/serie.controller');

// Rutas CRUD de series (Series de productos)
router.get('/', serieCtrl.listarSeries);
router.get('/:id', serieCtrl.obtenerSerie);
router.post('/', serieCtrl.crearSerie);
router.put('/:id', serieCtrl.actualizarSerie);
router.delete('/:id', serieCtrl.eliminarSerie);

module.exports = router;