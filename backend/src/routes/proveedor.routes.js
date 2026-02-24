const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedor.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Proveedores
 *   description: API para gestionar proveedores(8)
 */

/**
 * @swagger
 * /proveedores:
 *   get:
 *     summary: Obtener todos los proveedores
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de proveedores
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 *       500:
 *         description: Error al obtener proveedores
 */
router.get('/', verificarToken, proveedorController.obtenerProveedores);

/**
 * @swagger
 * /proveedores/buscar:
 *   get:
 *     summary: Buscar proveedores
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del proveedor a buscar
 *       - in: query
 *         name: ruc
 *         schema:
 *           type: string
 *         description: RUC del proveedor a buscar
 *     responses:
 *       200:
 *         description: Lista de proveedores encontrados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Proveedor'
 *       500:
 *         description: Error al buscar proveedores
 */
router.get('/buscar', verificarToken, proveedorController.buscarProveedores);

/**
 * @swagger
 * /proveedores/{id}:
 *   get:
 *     summary: Obtener proveedor por ID
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del proveedor
 *     responses:
 *       200:
 *         description: Proveedor encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al obtener proveedor
 */
router.get('/:id', verificarToken, proveedorController.obtenerProveedorPorId);

/**
 * @swagger
 * /proveedores:
 *   post:
 *     summary: Crear un nuevo proveedor
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       201:
 *         description: Proveedor creado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       500:
 *         description: Error al crear proveedor
 */
router.post('/', [verificarToken, esAdminOSuperAdmin], proveedorController.crearProveedor);

/**
 * @swagger
 * /proveedores/{id}:
 *   put:
 *     summary: Actualizar proveedor por ID
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del proveedor
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Proveedor'
 *     responses:
 *       200:
 *         description: Proveedor actualizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Proveedor'
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al actualizar proveedor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdmin], proveedorController.actualizarProveedor);

/**
 * @swagger
 * /proveedores/{id}:
 *   delete:
 *     summary: Eliminar proveedor por ID
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del proveedor
 *     responses:
 *       200:
 *         description: Proveedor eliminado
 *       404:
 *         description: Proveedor no encontrado
 *       500:
 *         description: Error al eliminar proveedor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdmin], proveedorController.eliminarProveedor);

/**
 * @swagger
 * /proveedores/reniec/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Consultar datos de RENIEC/SUNAT para proveedores
 *     tags: [Proveedores]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *           enum: [DNI, RUC]
 *         required: true
 *         description: Tipo de documento (DNI o RUC)
 *       - in: path
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         required: true
 *         description: Número de documento
 *     responses:
 *       200:
 *         description: Datos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 tipoDocumento:
 *                   type: string
 *                 datos:
 *                   type: object
 *                 nombreCompleto:
 *                   type: string
 *       400:
 *         description: Documento inválido
 *       500:
 *         description: Error al consultar RENIEC/SUNAT
 */
router.get('/reniec/:tipoDocumento/:numeroDocumento', verificarToken, proveedorController.consultarRENIEC);

module.exports = router;