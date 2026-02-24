const express = require('express');
const router = express.Router();
const documentoRecurrenciaController = require('../controllers/documentoRecurrencia.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: DocumentosRecurrencia
 *   description: API para gestión de documentos de recurrencia
 */

/**
 * @swagger
 * /documentos-recurrencia:
 *   get:
 *     summary: Obtener todos los documentos de recurrencia
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaEmision
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de emisión para filtrar (YYYY-MM-DD)
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango (YYYY-MM-DD)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango (YYYY-MM-DD)
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Búsqueda por serie, número o cliente
 *       - in: query
 *         name: tipoDocumento
 *         schema:
 *           type: string
 *         description: Tipo de documento
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado del documento
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Límite de resultados por página
 *     responses:
 *       200:
 *         description: Lista de documentos de recurrencia
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 documentos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/DocumentoRecurrencia'
 *                 total:
 *                   type: integer
 *                 page:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 */
router.get('/', verificarToken, esAdminOSuperAdminOCajero, documentoRecurrenciaController.obtenerDocumentosRecurrencia);

/**
 * @swagger
 * /documentos-recurrencia/{id}:
 *   get:
 *     summary: Obtener documento de recurrencia por ID
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento de recurrencia
 *     responses:
 *       200:
 *         description: Documento de recurrencia encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentoRecurrencia'
 */
router.get('/:id', verificarToken, esAdminOSuperAdminOCajero, documentoRecurrenciaController.obtenerDocumentoRecurrenciaPorId);

/**
 * @swagger
 * /documentos-recurrencia:
 *   post:
 *     summary: Crear nuevo documento de recurrencia
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentoRecurrenciaInput'
 *     responses:
 *       201:
 *         description: Documento de recurrencia creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentoRecurrencia'
 */
router.post('/', verificarToken, esAdminOSuperAdmin, documentoRecurrenciaController.crearDocumentoRecurrencia);

/**
 * @swagger
 * /documentos-recurrencia/{id}:
 *   put:
 *     summary: Actualizar documento de recurrencia
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento de recurrencia
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/DocumentoRecurrenciaInput'
 *     responses:
 *       200:
 *         description: Documento de recurrencia actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DocumentoRecurrencia'
 */
router.put('/:id', verificarToken, esAdminOSuperAdmin, documentoRecurrenciaController.actualizarDocumentoRecurrencia);

/**
 * @swagger
 * /documentos-recurrencia/{id}:
 *   delete:
 *     summary: Eliminar documento de recurrencia
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento de recurrencia
 *     responses:
 *       200:
 *         description: Documento de recurrencia eliminado exitosamente
 */
router.delete('/:id', verificarToken, esAdminOSuperAdmin, documentoRecurrenciaController.eliminarDocumentoRecurrencia);

/**
 * @swagger
 * /documentos-recurrencia/{id}/procesar:
 *   post:
 *     summary: Procesar recurrencia de documento
 *     tags: [DocumentosRecurrencia]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento de recurrencia
 *     responses:
 *       200:
 *         description: Recurrencia procesada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 documentoGenerado:
 *                   $ref: '#/components/schemas/DocumentoRecurrencia'
 */
router.post('/:id/procesar', verificarToken, esAdminOSuperAdminOCajero, documentoRecurrenciaController.procesarRecurrenciaDocumento);

module.exports = router;