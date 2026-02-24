const express = require('express');
const router = express.Router();
const resumenesController = require('../controllers/resumenes.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * tags:
 *   name: Resumenes
 *   description: Gestión de resúmenes de comprobantes (boletas y facturas)
 */

/**
 * @swagger
 * /resumenes:
 *   get:
 *     summary: Obtener todos los resúmenes con filtros
 *     description: Obtiene una lista paginada de resúmenes de comprobantes con filtros opcionales
 *     tags: [Resumenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaEmision
 *         schema:
 *           type: string
 *           enum: [hoy, ayer, esta-semana, este-mes, mes-anterior, personalizado]
 *         description: Filtro por fecha de emisión
 *         example: "hoy"
 *       - in: query
 *         name: busqueda
 *         schema:
 *           type: string
 *         description: Búsqueda por serie, número o cliente
 *         example: "B001"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal (solo para SuperAdmin)
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página actual
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Elementos por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de resúmenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       fechaEmision:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-22"
 *                       fechaReferencia:
 *                         type: string
 *                         format: date
 *                         example: "2024-01-22"
 *                       identificador:
 *                         type: string
 *                         example: "B001-000001"
 *                       estado:
 *                         type: string
 *                         enum: [PENDIENTE, ACEPTADO, RECHAZADO, ERROR]
 *                         example: "ACEPTADO"
 *                       ticket:
 *                         type: string
 *                         example: "TKT-123456789"
 *                       tipoComprobante:
 *                         type: string
 *                         enum: [BOLETA, FACTURA]
 *                         example: "BOLETA"
 *                       total:
 *                         type: number
 *                         example: 118.00
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalItems:
 *                       type: integer
 *                       example: 50
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, resumenesController.obtenerResumenes);

/**
 * @swagger
 * /resumenes:
 *   post:
 *     summary: Crear nuevo resumen
 *     description: Genera un resumen de comprobantes para una fecha específica
 *     tags: [Resumenes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - fechaComprobantes
 *             properties:
 *               fechaComprobantes:
 *                 type: string
 *                 format: date
 *                 description: Fecha de los comprobantes a resumir
 *                 example: "2024-01-22"
 *               sucursalId:
 *                 type: integer
 *                 description: ID de la sucursal (opcional para SuperAdmin)
 *                 example: 1
 *     responses:
 *       201:
 *         description: Resumen creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 mensaje:
 *                   type: string
 *                   example: "Resumen generado exitosamente"
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     fechaEmision:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-22"
 *                     fechaReferencia:
 *                       type: string
 *                       format: date
 *                       example: "2024-01-22"
 *                     identificador:
 *                       type: string
 *                       example: "RES-20240122"
 *                     estado:
 *                       type: string
 *                       example: "GENERADO"
 *                     ticket:
 *                       type: string
 *                       example: "TKT-1705939200000"
 *                     estadisticas:
 *                       type: object
 *                       properties:
 *                         totalComprobantes:
 *                           type: integer
 *                           example: 25
 *                         totalBoletas:
 *                           type: integer
 *                           example: 20
 *                         totalFacturas:
 *                           type: integer
 *                           example: 5
 *                         montoTotal:
 *                           type: number
 *                           example: 2950.00
 *                         montoSubtotal:
 *                           type: number
 *                           example: 2500.00
 *                         montoIGV:
 *                           type: number
 *                           example: 450.00
 *       400:
 *         description: Datos requeridos faltantes
 *       404:
 *         description: No se encontraron comprobantes para la fecha
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, resumenesController.crearResumen);

/**
 * @swagger
 * /resumenes/estadisticas:
 *   get:
 *     summary: Obtener estadísticas de resúmenes
 *     description: Obtiene estadísticas agregadas de comprobantes por tipo
 *     tags: [Resumenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *         example: "2024-01-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *         example: "2024-01-31"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal (solo para SuperAdmin)
 *         example: 1
 *     responses:
 *       200:
 *         description: Estadísticas obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 estadisticas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       tipo:
 *                         type: string
 *                         enum: [BOLETA, FACTURA]
 *                         example: "BOLETA"
 *                       cantidad:
 *                         type: integer
 *                         example: 150
 *                       montoTotal:
 *                         type: number
 *                         example: 17700.00
 *                       montoSubtotal:
 *                         type: number
 *                         example: 15000.00
 *                       montoIGV:
 *                         type: number
 *                         example: 2700.00
 *       500:
 *         description: Error del servidor
 */
router.get('/estadisticas', verificarToken, resumenesController.obtenerEstadisticas);

/**
 * @swagger
 * /resumenes/{id}/descargar/{tipo}:
 *   get:
 *     summary: Descargar archivo de resumen
 *     description: Descarga archivos XML, CDR o PDF de un resumen específico
 *     tags: [Resumenes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del resumen
 *         example: 1
 *       - in: path
 *         name: tipo
 *         required: true
 *         schema:
 *           type: string
 *           enum: [xml, cdr, pdf]
 *         description: Tipo de archivo a descargar
 *         example: "pdf"
 *     responses:
 *       200:
 *         description: Archivo descargado exitosamente
 *         content:
 *           application/octet-stream:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Resumen o archivo no encontrado
 *       403:
 *         description: Sin permisos para descargar
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/descargar/:tipo', verificarToken, resumenesController.descargarResumen);

module.exports = router;