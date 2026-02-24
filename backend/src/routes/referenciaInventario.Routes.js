const express = require('express');
const router = express.Router();
const {
  obtenerReferencias,
  obtenerReferenciaPorId,
  crearReferencia,
  actualizarReferencia,
  eliminarReferencia
} = require('../controllers/referenciaInventario.Controller');

// Middleware de autenticación (si existe)
// const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * components:
 *   schemas:
 *     ReferenciaInventario:
 *       type: object
 *       required:
 *         - codigo
 *         - descripcion
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la referencia
 *         codigo:
 *           type: string
 *           description: Código único de la referencia
 *           example: "REF001"
 *         descripcion:
 *           type: string
 *           description: Descripción de la referencia
 *           example: "Tornillo hexagonal 1/4"
 *         activo:
 *           type: boolean
 *           description: Estado de la referencia
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

// Rutas para referencias de inventario
router.get('/', obtenerReferencias);
router.get('/:id', obtenerReferenciaPorId);
router.post('/', crearReferencia);
router.put('/:id', actualizarReferencia);
router.delete('/:id', eliminarReferencia);

module.exports = router;