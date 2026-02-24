const express = require('express');
const router = express.Router();
const {
  exportarEtiquetas,
  obtenerProductosParaEtiquetas
} = require('../controllers/etiquetas.controller');

// Rutas para etiquetas
router.post('/exportar', exportarEtiquetas);
router.get('/productos', obtenerProductosParaEtiquetas);

module.exports = router;