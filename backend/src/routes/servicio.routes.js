const express = require('express');
const router = express.Router();

const servicioCtrl = require('../controllers/servicio.controller');

// CRUD de servicios
router.get('/', servicioCtrl.obtenerServicios);
router.get('/:id', servicioCtrl.obtenerServicioPorId);
router.post('/', servicioCtrl.crearServicio);
router.put('/:id', servicioCtrl.actualizarServicio);
router.delete('/:id', servicioCtrl.eliminarServicio);

module.exports = router;