const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productoCompuesto.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');

// Listar con filtros
router.get('/', verificarToken, ctrl.obtenerProductosCompuestos);

// Crear
router.post('/', [verificarToken, esAdminOSuperAdminOAlmacenero], ctrl.crearProductoCompuesto);

// Actualizar
router.put('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], ctrl.actualizarProductoCompuesto);

// Eliminar
router.delete('/:id', [verificarToken, esAdminOSuperAdmin], ctrl.eliminarProductoCompuesto);

module.exports = router;