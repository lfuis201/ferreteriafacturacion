const express = require('express');
const router = express.Router();
const conductorController = require('../controllers/conductor.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Conductores
 *   description: API para gestionar conductores
 */

/**
 * @swagger
 * /conductores:
 *   get:
 *     summary: Obtener todos los conductores
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de conductores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conductor'
 *       500:
 *         description: Error al obtener conductores
 */
router.get('/', verificarToken, conductorController.obtenerConductores);

/**
 * @swagger
 * /conductores/buscar:
 *   get:
 *     summary: Buscar conductores por nombre, documento o licencia
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del conductor a buscar
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: [DNI, CE, PASAPORTE]
 *         description: Tipo de documento del conductor
 *       - in: query
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         description: Número de documento del conductor
 *       - in: query
 *         name: licencia
 *         schema:
 *           type: string
 *         description: Número de licencia de conducir
 *     responses:
 *       200:
 *         description: Lista de conductores encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Conductor'
 *       500:
 *         description: Error al buscar conductores
 */
router.get('/buscar', verificarToken, conductorController.buscarConductores);

/**
 * @swagger
 * /conductores/{id}:
 *   get:
 *     summary: Obtener conductor por ID
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del conductor
 *     responses:
 *       200:
 *         description: Conductor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Conductor'
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error al obtener conductor
 */
router.get('/:id', verificarToken, conductorController.obtenerConductorPorId);

/**
 * @swagger
 * /conductores/reniec/{numeroDocumento}:
 *   get:
 *     summary: Consultar datos de RENIEC por DNI
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de DNI a consultar
 *     responses:
 *       200:
 *         description: Datos obtenidos de RENIEC
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 datos:
 *                   type: object
 *                   properties:
 *                     nombres:
 *                       type: string
 *                     apellidoPaterno:
 *                       type: string
 *                     apellidoMaterno:
 *                       type: string
 *                     direccion:
 *                       type: string
 *       400:
 *         description: DNI inválido
 *       500:
 *         description: Error al consultar RENIEC
 */
router.get('/reniec/:tipoDocumento/:numeroDocumento', verificarToken, conductorController.consultarRENIEC);

/**
 * @swagger
 * /conductores:
 *   post:
 *     summary: Crear un nuevo conductor
 *     description: |
 *       Crea un nuevo conductor en el sistema. Si se proporciona un DNI válido,
 *       se consulta automáticamente RENIEC para obtener los datos personales.
 *       
 *       **Funcionalidades automáticas:**
 *       - **DNI**: Consulta automática a RENIEC para obtener nombres y dirección
 *       - **Otros documentos**: Se crean con los datos proporcionados manualmente
 *       
 *       **Prioridad de datos:**
 *       - Si proporcionas un nombre, se mantiene (no se sobrescribe con RENIEC)
 *       - Si proporcionas una dirección, se mantiene (no se sobrescribe con RENIEC)
 *       - Los campos vacíos se completan automáticamente con datos de RENIEC
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre del conductor (opcional si se proporciona DNI válido)
 *                 example: "Juan Pérez"
 *               tipoDocumento:
 *                 type: string
 *                 enum: [DNI, CE, PASAPORTE]
 *                 description: Tipo de documento del conductor
 *                 example: "DNI"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del conductor
 *                 example: "71496588"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del conductor
 *                 example: "987654321"
 *               email:
 *                 type: string
 *                 description: Email del conductor
 *                 example: "conductor@example.com"
 *               licencia:
 *                 type: string
 *                 description: Número de licencia de conducir
 *                 example: "Q12345678"
 *               fechaVencimientoLicencia:
 *                 type: string
 *                 format: date
 *                 description: Fecha de vencimiento de la licencia
 *                 example: "2025-12-31"
 *               categoria:
 *                 type: string
 *                 enum: [A-I, A-IIa, A-IIb, A-IIIa, A-IIIb, A-IIIc, B-I, B-IIa, B-IIb, B-IIc]
 *                 description: Categoría de la licencia de conducir
 *                 example: "A-IIIb"
 *               direccion:
 *                 type: string
 *                 description: Dirección del conductor (opcional si se proporciona DNI válido)
 *                 example: "Av. Principal 123"
 *               consultarRENIEC:
 *                 type: boolean
 *                 description: Si debe consultar RENIEC automáticamente
 *                 example: true
 *             required:
 *               - tipoDocumento
 *               - numeroDocumento
 *               - licencia
 *               - fechaVencimientoLicencia
 *               - categoria
 *     responses:
 *       201:
 *         description: Conductor creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Conductor creado exitosamente"
 *                 conductor:
 *                   $ref: '#/components/schemas/Conductor'
 *       400:
 *         description: Error en la validación o conductor ya existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Ya existe un conductor con ese número de documento"
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verificarToken, conductorController.crearConductor);

/**
 * @swagger
 * /conductores/{id}:
 *   put:
 *     summary: Actualizar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del conductor a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *               licencia:
 *                 type: string
 *               fechaVencimientoLicencia:
 *                 type: string
 *                 format: date
 *               categoria:
 *                 type: string
 *               direccion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Conductor actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 conductor:
 *                   $ref: '#/components/schemas/Conductor'
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error al actualizar conductor
 */
router.put('/:id', verificarToken, conductorController.actualizarConductor);

/**
 * @swagger
 * /conductores/{id}:
 *   delete:
 *     summary: Eliminar un conductor
 *     tags: [Conductores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del conductor a eliminar
 *     responses:
 *       200:
 *         description: Conductor eliminado exitosamente
 *       404:
 *         description: Conductor no encontrado
 *       500:
 *         description: Error al eliminar conductor
 */
router.delete('/:id', verificarToken, conductorController.eliminarConductor);

module.exports = router;