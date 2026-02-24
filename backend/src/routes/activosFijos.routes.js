const express = require('express');
const router = express.Router();
const activosFijosController = require('../controllers/activosFijos.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOContador } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Activos Fijos
 *   description: API para gestión de activos fijos
 */

/**
 * @swagger
 * /activos-fijos:
 *   get:
 *     summary: Obtener todos los activos fijos
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [Maquinaria, Equipos, Vehículos, Muebles, Inmuebles, Tecnología, Herramientas, Otros]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo, En Mantenimiento, Dado de Baja, Vendido]
 *         description: Filtrar por estado
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar por fecha de compra
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar por fecha de compra
 *       - in: query
 *         name: responsable
 *         schema:
 *           type: string
 *         description: Buscar por responsable
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
 *         description: Lista de activos fijos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activosFijos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivoFijo'
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, activosFijosController.obtenerActivosFijos);

/**
 * @swagger
 * /activos-fijos/reporte:
 *   get:
 *     summary: Obtener reporte de activos fijos
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *           enum: [Maquinaria, Equipos, Vehículos, Muebles, Inmuebles, Tecnología, Herramientas, Otros]
 *         description: Filtrar por categoría
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [Activo, Inactivo, En Mantenimiento, Dado de Baja, Vendido]
 *         description: Filtrar por estado
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar por fecha de compra
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar por fecha de compra
 *     responses:
 *       200:
 *         description: Reporte de activos fijos con estadísticas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activosFijos:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ActivoFijo'
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalActivos:
 *                       type: integer
 *                     valorTotalCompra:
 *                       type: number
 *                     valorTotalActual:
 *                       type: number
 *                     depreciacionTotalAcumulada:
 *                       type: number
 *                     porcentajeDepreciacion:
 *                       type: number
 *                     activosPorCategoria:
 *                       type: object
 *                     activosPorEstado:
 *                       type: object
 *                     activosPorSucursal:
 *                       type: object
 *       403:
 *         description: No tiene permisos para ver reportes
 *       500:
 *         description: Error del servidor
 */
router.get('/reporte', verificarToken, activosFijosController.obtenerReporteActivosFijos);

/**
 * @swagger
 * /activos-fijos/categorias:
 *   get:
 *     summary: Obtener categorías de activos fijos
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías disponibles
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 categorias:
 *                   type: array
 *                   items:
 *                     type: string
 *       500:
 *         description: Error del servidor
 */
router.get('/categorias', verificarToken, activosFijosController.obtenerCategorias);

/**
 * @swagger
 * /activos-fijos/actualizar-depreciacion:
 *   put:
 *     summary: Actualizar depreciación de todos los activos fijos
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Depreciación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 activosActualizados:
 *                   type: integer
 *       403:
 *         description: No tiene permisos para actualizar depreciaciones
 *       500:
 *         description: Error del servidor
 */
router.put('/actualizar-depreciacion', verificarToken, esAdminOSuperAdminOContador, activosFijosController.actualizarDepreciacionTodos);

/**
 * @swagger
 * /activos-fijos/{id}:
 *   get:
 *     summary: Obtener un activo fijo por ID
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo fijo
 *     responses:
 *       200:
 *         description: Activo fijo encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activoFijo:
 *                   $ref: '#/components/schemas/ActivoFijo'
 *       404:
 *         description: Activo fijo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, activosFijosController.obtenerActivoFijoPorId);

/**
 * @swagger
 * /activos-fijos/{id}/calcular-depreciacion:
 *   put:
 *     summary: Calcular depreciación de un activo fijo específico
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo fijo
 *     responses:
 *       200:
 *         description: Depreciación calculada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 depreciacion:
 *                   type: object
 *                   properties:
 *                     valorCompra:
 *                       type: number
 *                     depreciacionAcumulada:
 *                       type: number
 *                     valorActual:
 *                       type: number
 *                     anosTranscurridos:
 *                       type: number
 *                     anosVidaUtil:
 *                       type: integer
 *                     depreciacionAnual:
 *                       type: number
 *       404:
 *         description: Activo fijo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/calcular-depreciacion', verificarToken, activosFijosController.calcularDepreciacion);

/**
 * @swagger
 * /activos-fijos:
 *   post:
 *     summary: Crear un nuevo activo fijo
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - codigo
 *               - valorCompra
 *               - fechaCompra
 *               - categoria
 *               - vidaUtilAnos
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [Maquinaria, Equipos, Vehículos, Muebles, Inmuebles, Tecnología, Herramientas, Otros]
 *               valorCompra:
 *                 type: number
 *               fechaCompra:
 *                 type: string
 *                 format: date
 *               fechaInicioDepreciacion:
 *                 type: string
 *                 format: date
 *               vidaUtilAnos:
 *                 type: integer
 *               metodoDepreciacion:
 *                 type: string
 *                 enum: [Lineal, Acelerada, Unidades de Producción]
 *               ubicacion:
 *                 type: string
 *               responsable:
 *                 type: string
 *               numeroSerie:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               proveedor:
 *                 type: string
 *               numeroFactura:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo, En Mantenimiento, Dado de Baja, Vendido]
 *               observaciones:
 *                 type: string
 *               sucursalId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Activo fijo creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 activoFijo:
 *                   $ref: '#/components/schemas/ActivoFijo'
 *       400:
 *         description: Datos inválidos o código duplicado
 *       403:
 *         description: No tiene permisos para crear activos fijos
 *       500:
 *         description: Error del servidor
 */
router.post('/', verificarToken, esAdminOSuperAdminOContador, activosFijosController.crearActivoFijo);

/**
 * @swagger
 * /activos-fijos/{id}:
 *   put:
 *     summary: Actualizar un activo fijo
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo fijo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               categoria:
 *                 type: string
 *                 enum: [Maquinaria, Equipos, Vehículos, Muebles, Inmuebles, Tecnología, Herramientas, Otros]
 *               valorCompra:
 *                 type: number
 *               fechaCompra:
 *                 type: string
 *                 format: date
 *               fechaInicioDepreciacion:
 *                 type: string
 *                 format: date
 *               vidaUtilAnos:
 *                 type: integer
 *               metodoDepreciacion:
 *                 type: string
 *                 enum: [Lineal, Acelerada, Unidades de Producción]
 *               ubicacion:
 *                 type: string
 *               responsable:
 *                 type: string
 *               numeroSerie:
 *                 type: string
 *               marca:
 *                 type: string
 *               modelo:
 *                 type: string
 *               proveedor:
 *                 type: string
 *               numeroFactura:
 *                 type: string
 *               estado:
 *                 type: string
 *                 enum: [Activo, Inactivo, En Mantenimiento, Dado de Baja, Vendido]
 *               observaciones:
 *                 type: string
 *               sucursalId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Activo fijo actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 activoFijo:
 *                   $ref: '#/components/schemas/ActivoFijo'
 *       400:
 *         description: Datos inválidos o código duplicado
 *       403:
 *         description: No tiene permisos para actualizar activos fijos
 *       404:
 *         description: Activo fijo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', verificarToken, esAdminOSuperAdminOContador, activosFijosController.actualizarActivoFijo);

/**
 * @swagger
 * /activos-fijos/{id}:
 *   delete:
 *     summary: Eliminar un activo fijo
 *     tags: [Activos Fijos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del activo fijo
 *     responses:
 *       200:
 *         description: Activo fijo eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: No tiene permisos para eliminar activos fijos
 *       404:
 *         description: Activo fijo no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', verificarToken, esAdminOSuperAdmin, activosFijosController.eliminarActivoFijo);

module.exports = router;