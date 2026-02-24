const express = require('express');
const router = express.Router();
const anulacionesController = require('../controllers/anulaciones.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Anulacion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID del documento anulado
 *         tipo:
 *           type: string
 *           enum: [VENTA, NOTA_VENTA, COMPRA, GUIA_REMISION]
 *           description: Tipo de documento anulado
 *         tipoComprobante:
 *           type: string
 *           description: Tipo de comprobante
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante
 *         fechaEmision:
 *           type: string
 *           format: date
 *           description: Fecha de emisión del documento
 *         fechaAnulacion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de anulación
 *         motivoAnulacion:
 *           type: string
 *           description: Motivo de la anulación
 *         total:
 *           type: number
 *           format: decimal
 *           description: Total del documento
 *         estado:
 *           type: string
 *           description: Estado del documento
 *         identificador:
 *           type: string
 *           description: Identificador único del documento
 *         ticket:
 *           type: string
 *           description: Número de ticket
 *         cliente:
 *           type: object
 *           properties:
 *             razonSocial:
 *               type: string
 *             numeroDocumento:
 *               type: string
 *         proveedor:
 *           type: object
 *           properties:
 *             razonSocial:
 *               type: string
 *             numeroDocumento:
 *               type: string
 *         usuarioAnulacion:
 *           type: object
 *           properties:
 *             nombre:
 *               type: string
 */

/**
 * @swagger
 * /api/anulaciones:
 *   get:
 *     summary: Obtener listado de anulaciones
 *     tags: [Anulaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar anulaciones
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar anulaciones
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [venta, nota_venta, compra, guia_remision]
 *         description: Tipo de documento a filtrar
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Lista de anulaciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 anulaciones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Anulacion'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     totalItems:
 *                       type: integer
 *                     itemsPerPage:
 *                       type: integer
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, anulacionesController.obtenerAnulaciones);

/**
 * @swagger
 * /api/anulaciones/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de anulaciones
 *     tags: [Anulaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar estadísticas
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar estadísticas
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     ventas:
 *                       type: integer
 *                     notasVenta:
 *                       type: integer
 *                     compras:
 *                       type: integer
 *                     guiasRemision:
 *                       type: integer
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/estadisticas', verificarToken, anulacionesController.obtenerEstadisticas);

/**
 * @swagger
 * /api/anulaciones/descargar/{tipo}/{id}/{formato}:
 *   get:
 *     summary: Descargar documento anulado
 *     tags: [Anulaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [venta, nota_venta, compra, guia_remision]
 *         description: Tipo de documento
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del documento
 *       - in: path
 *         name: formato
 *         required: true
 *         schema:
 *           type: string
 *           enum: [pdf, xml]
 *           default: pdf
 *         description: Formato de descarga
 *     responses:
 *       200:
 *         description: Documento descargado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 documento:
 *                   type: object
 *       400:
 *         description: Tipo de documento no válido o documento no anulado
 *       404:
 *         description: Documento no encontrado
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/descargar/:tipo/:id/:formato', verificarToken, anulacionesController.descargarDocumento);

module.exports = router;