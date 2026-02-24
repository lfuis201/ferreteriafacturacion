const express = require('express');
const SeriesCorrelativosController = require('../controllers/seriesCorrelativos.controller');
const { verificarToken, esSuperAdmin } = require('../middlewares/authMiddleware');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Series y Correlativos
 *   description: Gestión de series y correlativos para comprobantes electrónicos
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     SerieCorrelativo:
 *       type: object
 *       required:
 *         - sucursalId
 *         - tipoComprobante
 *         - serie
 *         - correlativoActual
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la serie
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *         tipoComprobante:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *           description: Tipo de comprobante
 *         serie:
 *           type: string
 *           description: Serie del comprobante (ej. F001, B001)
 *           maxLength: 4
 *         correlativoActual:
 *           type: integer
 *           description: Correlativo actual
 *           minimum: 1
 *         correlativoMaximo:
 *           type: integer
 *           description: Correlativo máximo permitido
 *           default: 99999999
 *         activo:
 *           type: boolean
 *           description: Si la serie está activa
 *           default: true
 *         porDefecto:
 *           type: boolean
 *           description: Si es la serie por defecto para el tipo
 *           default: false
 *         fechaCreacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         fechaActualizacion:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

/**
 * Rutas para gestión de series y correlativos de comprobantes electrónicos
 * Todas las rutas requieren autenticación y roles específicos
 */

// Middleware de autenticación para todas las rutas
router.use(verificarToken);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/series:
 *   get:
 *     summary: Obtener todas las series configuradas para una sucursal
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: tipoComprobante
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *         description: Filtrar por tipo de comprobante
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por series activas
 *     responses:
 *       200:
 *         description: Series obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SerieCorrelativo'
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *   post:
 *     summary: Crear nueva serie para un tipo de comprobante
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoComprobante
 *               - serie
 *               - correlativoActual
 *             properties:
 *               tipoComprobante:
 *                 type: string
 *                 enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *                 description: Tipo de comprobante
 *               serie:
 *                 type: string
 *                 description: Serie del comprobante (ej. F001, B001)
 *                 maxLength: 4
 *                 pattern: '^[A-Z0-9]{4}$'
 *               correlativoActual:
 *                 type: integer
 *                 description: Correlativo inicial
 *                 minimum: 1
 *                 default: 1
 *               correlativoMaximo:
 *                 type: integer
 *                 description: Correlativo máximo permitido
 *                 minimum: 1
 *                 default: 99999999
 *               porDefecto:
 *                 type: boolean
 *                 description: Si es la serie por defecto para el tipo
 *                 default: false
 *     responses:
 *       201:
 *         description: Serie creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SerieCorrelativo'
 *       400:
 *         description: Datos inválidos o serie ya existe
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get(
  '/:sucursalId/series',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.obtenerSeries
);

router.post(
  '/:sucursalId/series',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.crearSerie
);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/series/{serieId}:
 *   put:
 *     summary: Actualizar serie existente
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: path
 *         name: serieId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la serie
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serie:
 *                 type: string
 *                 description: Serie del comprobante (ej. F001, B001)
 *                 maxLength: 4
 *                 pattern: '^[A-Z0-9]{4}$'
 *               correlativoActual:
 *                 type: integer
 *                 description: Correlativo actual
 *                 minimum: 1
 *               correlativoMaximo:
 *                 type: integer
 *                 description: Correlativo máximo permitido
 *                 minimum: 1
 *               activo:
 *                 type: boolean
 *                 description: Si la serie está activa
 *               porDefecto:
 *                 type: boolean
 *                 description: Si es la serie por defecto para el tipo
 *     responses:
 *       200:
 *         description: Serie actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/SerieCorrelativo'
 *       400:
 *         description: Datos inválidos
 *       404:
 *         description: Serie o sucursal no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *   delete:
 *     summary: Eliminar serie (Solo SuperAdmin)
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: path
 *         name: serieId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la serie
 *     responses:
 *       200:
 *         description: Serie eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: No se puede eliminar serie con comprobantes asociados
 *       404:
 *         description: Serie o sucursal no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Solo SuperAdmin puede eliminar series
 */
router.put(
  '/:sucursalId/series/:serieId',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.actualizarSerie
);

router.delete(
  '/:sucursalId/series/:serieId',
  esSuperAdmin,
  SeriesCorrelativosController.eliminarSerie
);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/siguiente-correlativo:
 *   get:
 *     summary: Obtener siguiente correlativo para una serie
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: tipoComprobante
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *         description: Tipo de comprobante
 *       - in: query
 *         name: serie
 *         schema:
 *           type: string
 *         description: Serie específica (opcional, usa la por defecto si no se especifica)
 *     responses:
 *       200:
 *         description: Siguiente correlativo obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     serie:
 *                       type: string
 *                       description: Serie del comprobante
 *                     siguienteCorrelativo:
 *                       type: integer
 *                       description: Siguiente correlativo disponible
 *                     numeroCompleto:
 *                       type: string
 *                       description: Número completo del comprobante (serie-correlativo)
 *       400:
 *         description: Tipo de comprobante requerido
 *       404:
 *         description: Serie no encontrada para el tipo de comprobante
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get(
  '/:sucursalId/siguiente-correlativo',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.obtenerSiguienteCorrelativo
);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/incrementar-correlativo:
 *   post:
 *     summary: Incrementar correlativo de una serie
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tipoComprobante
 *               - serie
 *             properties:
 *               tipoComprobante:
 *                 type: string
 *                 enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *                 description: Tipo de comprobante
 *               serie:
 *                 type: string
 *                 description: Serie del comprobante
 *               incremento:
 *                 type: integer
 *                 description: Cantidad a incrementar (por defecto 1)
 *                 minimum: 1
 *                 default: 1
 *     responses:
 *       200:
 *         description: Correlativo incrementado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     correlativoAnterior:
 *                       type: integer
 *                       description: Correlativo antes del incremento
 *                     correlativoActual:
 *                       type: integer
 *                       description: Correlativo después del incremento
 *                     serie:
 *                       type: string
 *                       description: Serie del comprobante
 *       400:
 *         description: Datos inválidos o correlativo máximo alcanzado
 *       404:
 *         description: Serie no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post(
  '/:sucursalId/incrementar-correlativo',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.incrementarCorrelativo
);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/series-por-tipo/{tipoComprobante}:
 *   get:
 *     summary: Obtener series por tipo de comprobante
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: path
 *         name: tipoComprobante
 *         required: true
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *         description: Tipo de comprobante
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar solo series activas
 *     responses:
 *       200:
 *         description: Series obtenidas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SerieCorrelativo'
 *       404:
 *         description: No se encontraron series para el tipo de comprobante
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.get(
  '/:sucursalId/series-por-tipo/:tipoComprobante',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.obtenerSeriesPorTipo
);

/**
 * @swagger
 * /series-correlativos/{sucursalId}/inicializar-defecto:
 *   post:
 *     summary: Inicializar series por defecto para una sucursal
 *     tags: [Series y Correlativos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sobreescribir:
 *                 type: boolean
 *                 description: Si sobreescribir series existentes
 *                 default: false
 *               tiposComprobante:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [FACTURA, BOLETA, NOTA_CREDITO, NOTA_DEBITO, GUIA_REMISION]
 *                 description: Tipos de comprobante a inicializar (opcional, todos si no se especifica)
 *     responses:
 *       201:
 *         description: Series por defecto inicializadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     seriesCreadas:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/SerieCorrelativo'
 *                     seriesExistentes:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Series que ya existían
 *       400:
 *         description: Error en la inicialización
 *       404:
 *         description: Sucursal no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 */
router.post(
  '/:sucursalId/inicializar-defecto',
  esAdminOSuperAdmin,
  SeriesCorrelativosController.inicializarSeriesDefecto
);

// Middleware de manejo de errores específico para series y correlativos
router.use((error, req, res, next) => {
  console.error('Error en rutas de series y correlativos:', error);
  
  // Errores de validación de Sequelize
  if (error.name === 'SequelizeValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      errors: error.errors.map(err => ({
        field: err.path,
        message: err.message
      }))
    });
  }
  
  // Errores de restricción única
  if (error.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json({
      success: false,
      message: 'Ya existe un registro con estos datos',
      field: error.errors[0]?.path
    });
  }
  
  // Error genérico
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

module.exports = router;