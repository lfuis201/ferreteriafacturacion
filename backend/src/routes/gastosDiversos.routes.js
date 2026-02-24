const express = require('express');
const router = express.Router();
// Usar el middleware de autenticación unificado que carga el usuario desde BD
const { verificarToken } = require('../middlewares/authMiddleware');
const { tieneRol } = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/gastoDiverso.controller');

// Todas las rutas requieren autenticación
router.use(verificarToken);

// Listar y buscar
router.get('/', ctrl.obtenerGastos);

// Obtener por id
router.get('/:id', ctrl.obtenerGastoPorId);

// Crear
router.post('/', tieneRol(['SuperAdmin', 'Admin']), ctrl.crearGasto);

// Actualizar
router.put('/:id', tieneRol(['SuperAdmin', 'Admin']), ctrl.actualizarGasto);

// Eliminar
router.delete('/:id', tieneRol(['SuperAdmin', 'Admin']), ctrl.eliminarGasto);

module.exports = router;