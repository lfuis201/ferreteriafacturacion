const express = require('express');
const router = express.Router();
const planillaController = require('../controllers/planilla.controller');
const verificarToken = require('../middlewares/verificarToken');
const {esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * components:
 *   schemas:
 *     Trabajador:
 *       type: object
 *       required:
 *         - nombres
 *         - apellidos
 *         - puesto
 *         - edad
 *         - sexo
 *         - fechaIngreso
 *         - sueldo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del trabajador
 *         nombres:
 *           type: string
 *           description: Nombres del trabajador
 *           example: "Juan Carlos"
 *         apellidos:
 *           type: string
 *           description: Apellidos del trabajador
 *           example: "Pérez García"
 *         puesto:
 *           type: string
 *           description: Puesto de trabajo
 *           example: "Mecánico"
 *         edad:
 *           type: integer
 *           minimum: 18
 *           maximum: 70
 *           description: Edad del trabajador
 *           example: 35
 *         sexo:
 *           type: string
 *           enum: ['M', 'F']
 *           description: Sexo del trabajador
 *           example: "M"
 *         fechaIngreso:
 *           type: string
 *           format: date
 *           description: Fecha de ingreso a la empresa
 *           example: "2023-01-15"
 *         sueldo:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Sueldo base del trabajador
 *           example: 1500.00
 *         adelantoSueldo:
 *           type: number
 *           format: decimal
 *           minimum: 0
 *           description: Adelanto de sueldo otorgado
 *           example: 300.00
 *         observaciones:
 *           type: string
 *           description: Observaciones adicionales
 *           example: "Trabajador destacado"
 *         activo:
 *           type: boolean
 *           description: Estado del trabajador
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /planilla:
 *   post:
 *     summary: Crear nuevo trabajador en planilla
 *     tags: [Planilla]
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
 *               - edad
 *               - sexo
 *               - fechaIngreso
 *               - sueldo
 *             properties:
 *               nombres:
 *                 type: string
 *                 example: "Juan Carlos"
 *               apellidos:
 *                 type: string
 *                 example: "Pérez García"
 *               puesto:
 *                 type: string
 *                 example: "Mecánico"
 *               edad:
 *                 type: integer
 *                 example: 35
 *               sexo:
 *                 type: string
 *                 enum: ['M', 'F']
 *                 example: "M"
 *               fechaIngreso:
 *                 type: string
 *                 format: date
 *                 example: "2023-01-15"
 *               sueldo:
 *                 type: number
 *                 example: 1500.00
 *               adelantoSueldo:
 *                 type: number
 *                 example: 300.00
 *               observaciones:
 *                 type: string
 *                 example: "Trabajador destacado"
 *     responses:
 *       201:
 *         description: Trabajador creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 trabajador:
 *                   $ref: '#/components/schemas/Trabajador'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdmin], planillaController.crearTrabajador);

/**
 * @swagger
 * /planilla:
 *   get:
 *     summary: Obtener todos los trabajadores con filtros
 *     tags: [Planilla]
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
 *         description: Filtrar por puesto de trabajo
 *       - in: query
 *         name: sexo
 *         schema:
   *           type: string
   *           enum: ['M', 'F']
 *         description: Filtrar por sexo
 *       - in: query
 *         name: buscar
 *         schema:
 *           type: string
 *         description: Buscar por nombres o apellidos
 *       - in: query
 *         name: fechaIngresoDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de ingreso desde
 *       - in: query
 *         name: fechaIngresoHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de ingreso hasta
 *     responses:
 *       200:
 *         description: Lista de trabajadores obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalTrabajadores:
 *                       type: integer
 *                     totalSueldos:
 *                       type: number
 *                     totalAdelantos:
 *                       type: number
 *                     sueldoPromedio:
 *                       type: number
 *                 trabajadores:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Trabajador'
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', [verificarToken, esAdminOSuperAdmin], planillaController.obtenerTrabajadores);

/**
 * @swagger
 * /planilla/{id}:
 *   get:
 *     summary: Obtener trabajador por ID
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 trabajador:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Trabajador'
 *                     - type: object
 *                       properties:
 *                         añosServicio:
 *                           type: number
 *                           description: Años de servicio calculados
 *                         saldoPendiente:
 *                           type: number
 *                           description: Saldo pendiente de pago
 *       404:
 *         description: Trabajador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', [verificarToken, esAdminOSuperAdmin], planillaController.obtenerTrabajadorPorId);

/**
 * @swagger
 * /planilla/{id}:
 *   put:
 *     summary: Actualizar trabajador
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
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
 *               edad:
 *                 type: integer
 *               sexo:
   *                 type: string
   *                 enum: ['M', 'F']
 *               fechaIngreso:
 *                 type: string
 *                 format: date
 *               sueldo:
 *                 type: number
 *               adelantoSueldo:
 *                 type: number
 *               observaciones:
 *                 type: string
 *               activo:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Trabajador actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 trabajador:
 *                   $ref: '#/components/schemas/Trabajador'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Trabajador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdmin], planillaController.actualizarTrabajador);

/**
 * @swagger
 * /planilla/{id}/eliminar:
 *   patch:
 *     summary: Dar de baja a trabajador (soft delete)
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador dado de baja exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Trabajador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/eliminar', [verificarToken, esAdminOSuperAdmin], planillaController.eliminarTrabajador);

/**
 * @swagger
 * /planilla/{id}/activar:
 *   patch:
 *     summary: Reactivar trabajador
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     responses:
 *       200:
 *         description: Trabajador reactivado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 trabajador:
 *                   $ref: '#/components/schemas/Trabajador'
 *       404:
 *         description: Trabajador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/activar', [verificarToken, esAdminOSuperAdmin], planillaController.activarTrabajador);

/**
 * @swagger
 * /planilla/{id}/adelanto:
 *   patch:
 *     summary: Actualizar adelanto de sueldo
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del trabajador
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adelantoSueldo
 *             properties:
 *               adelantoSueldo:
 *                 type: number
 *                 minimum: 0
 *                 description: Nuevo monto del adelanto
 *                 example: 500.00
 *     responses:
 *       200:
 *         description: Adelanto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 trabajador:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     nombres:
 *                       type: string
 *                     apellidos:
 *                       type: string
 *                     sueldo:
 *                       type: number
 *                     adelantoSueldo:
 *                       type: number
 *                     saldoPendiente:
 *                       type: number
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Trabajador no encontrado
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id/adelanto', [verificarToken, esAdminOSuperAdmin], planillaController.actualizarAdelanto);

/**
 * @swagger
 * /planilla/reporte:
 *   get:
 *     summary: Generar reporte de planilla
 *     tags: [Planilla]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: mes
 *         schema:
 *           type: string
 *           pattern: '^(0?[1-9]|1[0-2])$'
 *         description: Mes para filtrar (1-12)
 *         example: "3"
 *       - in: query
 *         name: año
 *         schema:
 *           type: string
 *           pattern: '^[0-9]{4}$'
 *         description: Año para filtrar
 *         example: "2024"
 *       - in: query
 *         name: puesto
 *         schema:
 *           type: string
 *         description: Filtrar por puesto
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 reporte:
 *                   type: object
 *                   properties:
 *                     filtros:
 *                       type: object
 *                     resumen:
 *                       type: object
 *                       properties:
 *                         totalTrabajadores:
 *                           type: integer
 *                         totalSueldos:
 *                           type: number
 *                         totalAdelantos:
 *                           type: number
 *                         totalAPagar:
 *                           type: number
 *                         sueldoPromedio:
 *                           type: number
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         porPuesto:
 *                           type: object
 *                         porSexo:
 *                           type: object
 *                     trabajadores:
 *                       type: array
 *                       items:
 *                         type: object
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reporte', [verificarToken, esAdminOSuperAdmin], planillaController.generarReportePlanilla);

module.exports = router;