const express = require('express');
const router = express.Router();
const marcaCtrl = require('../controllers/marca.controller');

// Rutas CRUD de marcas
router.get('/', marcaCtrl.listarMarcas);
router.get('/:id', marcaCtrl.obtenerMarca);
router.post('/', marcaCtrl.crearMarca);
router.put('/:id', marcaCtrl.actualizarMarca);
router.delete('/:id', marcaCtrl.eliminarMarca);

module.exports = router;