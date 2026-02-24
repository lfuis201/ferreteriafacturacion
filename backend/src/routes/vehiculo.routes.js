const express = require('express');
const router = express.Router();
const vehiculoController = require('../controllers/vehiculo.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Vehiculos
 *   description: API para gestionar vehículos
 */

/**
 * @swagger
 * /vehiculos:
 *   get:
 *     summary: Obtener todos los vehículos
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: tipoVehiculo
 *         schema:
 *           type: string
 *           enum: ['Camión', 'Camioneta', 'Furgón', 'Remolque', 'Semirremolque', 'Otro']
 *         description: Filtrar por tipo de vehículo
 *     responses:
 *       200:
 *         description: Lista de vehículos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehiculo'
 *                 filtros:
 *                   type: object
 *       500:
 *         description: Error al obtener vehículos
 */
router.get('/', verificarToken, vehiculoController.obtenerVehiculos);

/**
 * @swagger
 * /vehiculos/buscar:
 *   get:
 *     summary: Buscar vehículos por placa, marca o modelo
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: placa
 *         schema:
 *           type: string
 *         description: Placa del vehículo a buscar
 *       - in: query
 *         name: marca
 *         schema:
 *           type: string
 *         description: Marca del vehículo a buscar
 *       - in: query
 *         name: modelo
 *         schema:
 *           type: string
 *         description: Modelo del vehículo a buscar
 *     responses:
 *       200:
 *         description: Vehículos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         description: Debe proporcionar al menos un término de búsqueda
 *       500:
 *         description: Error al buscar vehículos
 */
router.get('/buscar', verificarToken, vehiculoController.buscarVehiculos);

/**
 * @swagger
 * /vehiculos/{id}:
 *   get:
 *     summary: Obtener un vehículo por ID
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al obtener el vehículo
 */
router.get('/:id', verificarToken, vehiculoController.obtenerVehiculoPorId);

/**
 * @swagger
 * /vehiculos/placa/{placa}:
 *   get:
 *     summary: Buscar vehículo por placa
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: placa
 *         required: true
 *         schema:
 *           type: string
 *         description: Placa del vehículo
 *     responses:
 *       200:
 *         description: Vehículo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al buscar el vehículo
 */
router.get('/placa/:placa', verificarToken, vehiculoController.buscarPorPlaca);

/**
 * @swagger
 * /vehiculos/tipo/{tipo}:
 *   get:
 *     summary: Obtener vehículos por tipo
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: ['Camión', 'Camioneta', 'Furgón', 'Remolque', 'Semirremolque', 'Otro']
 *         description: Tipo de vehículo
 *     responses:
 *       200:
 *         description: Vehículos encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Vehiculo'
 *                 tipo:
 *                   type: string
 *       500:
 *         description: Error al obtener vehículos por tipo
 */
// Ruta comentada porque se eliminó la función obtenerPorTipo
// router.get('/tipo/:tipo', verificarToken, vehiculoController.obtenerPorTipo);

/**
 * @swagger
 * /vehiculos:
 *   post:
 *     summary: Crear un nuevo vehículo
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nroPlacaId
 *               - marcaVehiculo
 *               - modeloVehiculo
 *             properties:
 *               nroPlacaId:
 *                 type: string
 *                 description: Número de placa del vehículo
 *               tucId:
 *                 type: string
 *                 description: T.U.C del vehículo
 *               autorizacionMTCPlacaPrincipal:
 *                 type: string
 *                 description: Autorización MTC placa principal
 *               nroPlacaSecundariaId:
 *                 type: string
 *                 description: Número de placa secundaria
 *               tucPlacaSecundariaId:
 *                 type: string
 *                 description: T.U.C placa secundaria
 *               autorizacionMTCPlacaSecundaria:
 *                 type: string
 *                 description: Autorización MTC placa secundaria
 *               modeloVehiculo:
 *                 type: string
 *                 description: Modelo del vehículo
 *               marcaVehiculo:
 *                 type: string
 *                 description: Marca del vehículo
 *     responses:
 *       201:
 *         description: Vehículo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         description: Error de validación
 *       500:
 *         description: Error al crear el vehículo
 */
router.post('/', verificarToken, vehiculoController.crearVehiculo);

/**
 * @swagger
 * /vehiculos/{id}:
 *   put:
 *     summary: Actualizar un vehículo
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nroPlacaId:
 *                 type: string
 *                 description: Número de placa del vehículo
 *               tucId:
 *                 type: string
 *                 description: T.U.C del vehículo
 *               autorizacionMTCPlacaPrincipal:
 *                 type: string
 *                 description: Autorización MTC placa principal
 *               nroPlacaSecundariaId:
 *                 type: string
 *                 description: Número de placa secundaria
 *               tucPlacaSecundariaId:
 *                 type: string
 *                 description: T.U.C placa secundaria
 *               autorizacionMTCPlacaSecundaria:
 *                 type: string
 *                 description: Autorización MTC placa secundaria
 *               modeloVehiculo:
 *                 type: string
 *                 description: Modelo del vehículo
 *               marcaVehiculo:
 *                 type: string
 *                 description: Marca del vehículo
 *     responses:
 *       200:
 *         description: Vehículo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 vehiculo:
 *                   $ref: '#/components/schemas/Vehiculo'
 *       400:
 *         description: Error de validación
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al actualizar el vehículo
 */
router.put('/:id', verificarToken, vehiculoController.actualizarVehiculo);

/**
 * @swagger
 * /vehiculos/{id}:
 *   delete:
 *     summary: Eliminar (desactivar) un vehículo
 *     tags: [Vehiculos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del vehículo
 *     responses:
 *       200:
 *         description: Vehículo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Vehículo no encontrado
 *       500:
 *         description: Error al eliminar el vehículo
 */
router.delete('/:id', verificarToken, vehiculoController.eliminarVehiculo);

module.exports = router;