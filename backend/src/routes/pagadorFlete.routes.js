const express = require('express');
const router = express.Router();
const pagadorFleteController = require('../controllers/pagadorFlete.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Pagadores de Flete
 *   description: API para gestión de pagadores de flete
 */

/**
 * @swagger
 * /pagadores-flete:
 *   get:
 *     summary: Obtener todos los pagadores de flete
 *     tags: [Pagadores de Flete]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de pagadores de flete obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pagadoresFlete:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PagadorFlete'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, pagadorFleteController.obtenerPagadoresFlete);

/**
 * @swagger
 * /pagadores-flete/buscar:
 *   get:
 *     summary: Buscar pagadores de flete
 *     tags: [Pagadores de Flete]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Nombre del pagador de flete
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *         description: Tipo de documento
 *       - in: query
 *         name: numeroDocumento
 *         schema:
 *           type: string
 *         description: Número de documento
 *     responses:
 *       200:
 *         description: Resultados de búsqueda
 *       400:
 *         description: Parámetros de búsqueda inválidos
 *       500:
 *         description: Error del servidor
 */
router.get('/buscar', verificarToken, pagadorFleteController.buscarPagadoresFlete);

/**
 * @swagger
 * /pagadores-flete/{id}:
 *   get:
 *     summary: Obtener un pagador de flete por ID
 *     tags: [Pagadores de Flete]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pagador de flete
 *     responses:
 *       200:
 *         description: Pagador de flete encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 pagadorFlete:
 *                   $ref: '#/components/schemas/PagadorFlete'
 *       404:
 *         description: Pagador de flete no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, pagadorFleteController.obtenerPagadorFletePorId);

/**
 * @swagger
 * /pagadores-flete/reniec/{tipoDocumento}/{numeroDocumento}:
 *   get:
 *     summary: Consultar datos de RENIEC/SUNAT por documento
 *     tags: [Pagadores de Flete]
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
 *         description: Número de documento a consultar
 *     responses:
 *       200:
 *         description: Datos obtenidos de RENIEC/SUNAT
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
router.get('/reniec/:tipoDocumento/:numeroDocumento', verificarToken, pagadorFleteController.consultarRENIEC);

/**
 * @swagger
 * /pagadores-flete:
 *   post:
 *     summary: Crear un nuevo pagador de flete
 *     description: |
 *       Crea un nuevo pagador de flete en el sistema. Si se proporciona un DNI o RUC válido,
 *       se consulta automáticamente RENIEC/SUNAT para obtener los datos.
 *       
 *       **Funcionalidades automáticas:**
 *       - **DNI**: Consulta automática a RENIEC para obtener nombres y dirección
 *       - **RUC**: Consulta automática a SUNAT para obtener razón social y dirección
 *       - **Otros documentos**: Se crean con los datos proporcionados manualmente
 *       
 *       **Prioridad de datos:**
 *       - Si proporcionas un nombre, se mantiene (no se sobrescribe con RENIEC/SUNAT)
 *       - Si proporcionas una dirección, se mantiene (no se sobrescribe con RENIEC/SUNAT)
 *       - Los campos vacíos se completan automáticamente con datos de RENIEC/SUNAT
 *     tags: [Pagadores de Flete]
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
 *                 description: Nombre del pagador de flete (opcional si se proporciona DNI/RUC válido)
 *                 example: "EMPRESA TRANSPORTES SAC"
 *               tipoDocumento:
 *                 type: string
 *                 enum: [DNI, RUC, CE, PASAPORTE]
 *                 description: Tipo de documento del pagador de flete
 *                 example: "RUC"
 *               numeroDocumento:
 *                 type: string
 *                 description: Número de documento del pagador de flete
 *                 example: "20123456789"
 *               telefono:
 *                 type: string
 *                 description: Teléfono del pagador de flete
 *                 example: "987654321"
 *               direccion:
 *                 type: string
 *                 description: Dirección del pagador de flete (opcional si se proporciona DNI/RUC válido)
 *                 example: "Av. Principal 123"
 *               departamento:
 *                 type: string
 *                 description: Departamento del ubigeo
 *                 example: "LIMA"
 *               provincia:
 *                 type: string
 *                 description: Provincia del ubigeo
 *                 example: "LIMA"
 *               distrito:
 *                 type: string
 *                 description: Distrito del ubigeo
 *                 example: "LIMA"
 *               ubigeo:
 *                 type: string
 *                 description: Código de ubigeo
 *                 example: "150101"
 *               consultarRENIEC:
 *                 type: boolean
 *                 description: Si debe consultar RENIEC/SUNAT automáticamente
 *                 example: true
 *             required:
 *               - tipoDocumento
 *               - numeroDocumento
 *     responses:
 *       201:
 *         description: Pagador de flete creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 pagadorFlete:
 *                   $ref: '#/components/schemas/PagadorFlete'
 *                 consultaRENIECRealizada:
 *                   type: boolean
 *                 consultaRENIECExitosa:
 *                   type: boolean
 *                 datosRENIEC:
 *                   type: object
 *       400:
 *         description: Datos inválidos o pagador de flete ya existe
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, pagadorFleteController.crearPagadorFlete);

/**
 * @swagger
 * /pagadores-flete/{id}:
 *   put:
 *     summary: Actualizar un pagador de flete
 *     tags: [Pagadores de Flete]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pagador de flete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               tipoDocumento:
 *                 type: string
 *               numeroDocumento:
 *                 type: string
 *               telefono:
 *                 type: string
 *               direccion:
 *                 type: string
 *               departamento:
 *                 type: string
 *               provincia:
 *                 type: string
 *               distrito:
 *                 type: string
 *               ubigeo:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pagador de flete actualizado exitosamente
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Pagador de flete no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, pagadorFleteController.actualizarPagadorFlete);

/**
 * @swagger
 * /pagadores-flete/{id}:
 *   delete:
 *     summary: Eliminar un pagador de flete
 *     tags: [Pagadores de Flete]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del pagador de flete
 *     responses:
 *       200:
 *         description: Pagador de flete eliminado exitosamente
 *       404:
 *         description: Pagador de flete no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, pagadorFleteController.eliminarPagadorFlete);

module.exports = router;