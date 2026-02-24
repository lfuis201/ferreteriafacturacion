const express = require('express');
const router = express.Router();
const operarioController = require('../controllers/operario.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdminOTrabajador } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Operarios
 *   description: API para gestión de operarios de taller
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Operario:
 *       type: object
 *       required:
 *         - nombres
 *         - apellidos
 *         - puesto
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del operario
 *         nombres:
 *           type: string
 *           description: Nombres del operario
 *           example: Juan Carlos
 *         apellidos:
 *           type: string
 *           description: Apellidos del operario
 *           example: Pérez García
 *         puesto:
 *           type: string
 *           description: Puesto de trabajo
 *           example: Mecánico Automotriz
 *         especialidad:
 *           type: string
 *           description: Especialidad técnica
 *           example: Motores Diesel
 *         telefono:
 *           type: string
 *           description: Número de teléfono
 *           example: 987654321
 *         activo:
 *           type: boolean
 *           description: Estado del operario
 *           default: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /operarios:
 *   post:
 *     summary: Crear un nuevo operario
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombres
 *               - apellidos
 *               - puesto
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: Juan Carlos
 *               apellidos:
 *                 type: string
 *                 example: Pérez García
 *               puesto:
 *                 type: string
 *                 example: Mecánico Automotriz
 *               especialidad:
 *                 type: string
 *                 example: Motores Diesel
 *               telefono:
 *                 type: string
 *                 example: 987654321
 *               activo:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Operario creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operario:
 *                   $ref: '#/components/schemas/Operario'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.crearOperario);

/**
 * @swagger
 * /operarios:
 *   get:
 *     summary: Obtener todos los operarios
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo/inactivo
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *         description: Filtrar por puesto (búsqueda parcial)
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar en nombres o apellidos
 *     responses:
 *       200:
 *         description: Lista de operarios obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operarios:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Operario'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.obtenerOperarios);

/**
 * @swagger
 * /operarios/activos:
 *   get:
 *     summary: Obtener operarios activos (para selects)
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de operarios activos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operarios:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nombres:
 *                         type: string
 *                       apellidos:
 *                         type: string
 *                       puesto:
 *                         type: string
 *                       especialidad:
 *                         type: string
 *       500:
 *         description: Error interno del servidor
 */
router.get('/activos', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.obtenerOperariosActivos);

/**
 * @swagger
 * /operarios/{id}:
 *   get:
 *     summary: Obtener operario por ID
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del operario
 *     responses:
 *       200:
 *         description: Operario obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operario:
 *                   $ref: '#/components/schemas/Operario'
 *       404:
 *         description: Operario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.obtenerOperarioPorId);

/**
 * @swagger
 * /operarios/{id}:
 *   put:
 *     summary: Actualizar operario
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del operario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombres:
 *                 type: string
 *               apellidos:
 *                 type: string
 *               puesto:
 *                 type: string
 *               especialidad:
 *                 type: string
 *               telefono:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Operario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operario:
 *                   $ref: '#/components/schemas/Operario'
 *       404:
 *         description: Operario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.actualizarOperario);

/**
 * @swagger
 * /operarios/{id}:
 *   delete:
 *     summary: Desactivar operario (soft delete)
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del operario
 *     responses:
 *       200:
 *         description: Operario desactivado exitosamente
 *       404:
 *         description: Operario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.eliminarOperario);

/**
 * @swagger
 * /operarios/{id}/activar:
 *   patch:
 *     summary: Activar operario
 *     tags: [Operarios]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del operario
 *     responses:
 *       200:
 *         description: Operario activado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 operario:
 *                   $ref: '#/components/schemas/Operario'
 *       404:
 *         description: Operario no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/activar', [verificarToken, esAdminOSuperAdminOTrabajador], operarioController.activarOperario);

module.exports = router;