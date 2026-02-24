const express = require('express');
const router = express.Router();
const ventaController = require('../controllers/venta.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero } = require('../middlewares/roleMiddleware');
const { middlewareContabilidadVenta } = require('../middlewares/contabilidad.middleware');



/**
 * @swagger
 * tags:
 *   name: Ventas
 *   description: API para gestión de ventas(11)
 */

/**
 * @swagger
 * /ventas:
 *   get:
 *     summary: Obtener todas las ventas
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: Filtrar por cliente
 *       - in: query
 *         name: fechaVenta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de venta para filtrar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Venta'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, ventaController.obtenerVentas);

// Consolidado de ítems de ventas
router.get('/consolidado-items', verificarToken, ventaController.obtenerConsolidadoItemsVentas);

/**
 * @swagger
 * /ventas/siguiente-numero:
 *   get:
 *     summary: Obtener el siguiente número de comprobante disponible
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: serieComprobante
 *         required: true
 *         schema:
 *           type: string
 *         description: Serie del comprobante (ej. FTR1, BTR1)
 *       - in: query
 *         name: sucursalId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Siguiente número obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 siguienteNumero:
 *                   type: string
 *                 serieComprobante:
 *                   type: string
 *                 numeroCompleto:
 *                   type: string
 */
router.get('/siguiente-numero', verificarToken, ventaController.obtenerSiguienteNumero);

/**
 * @swagger
 * /ventas/comprobantes-no-enviados:
 *   get:
 *     summary: Obtener comprobantes no enviados a SUNAT
 *     description: Obtiene una lista de comprobantes (facturas y boletas) que no han sido enviados correctamente a SUNAT
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal (opcional para SuperAdmin)
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del filtro
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del filtro
 *       - in: query
 *         name: tipoComprobante
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA, TODOS]
 *         description: Tipo de comprobante a filtrar
 *       - in: query
 *         name: serie
 *         schema:
 *           type: string
 *         description: Serie del comprobante
 *       - in: query
 *         name: numero
 *         schema:
 *           type: string
 *         description: Número del comprobante
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Página actual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Comprobantes no enviados obtenidos exitosamente
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fechaEmision:
 *                         type: string
 *                         format: date
 *                       tipoComprobante:
 *                         type: string
 *                       serie:
 *                         type: string
 *                       numero:
 *                         type: string
 *                       comprobante:
 *                         type: string
 *                       cliente:
 *                         type: string
 *                       clienteDocumento:
 *                         type: string
 *                       rucEmisor:
 *                         type: string
 *                       razonSocialEmisor:
 *                         type: string
 *                       moneda:
 *                         type: string
 *                       total:
 *                         type: string
 *                       subtotal:
 *                         type: string
 *                       igv:
 *                         type: string
 *                       estadoSunat:
 *                         type: string
 *                       motivoError:
 *                         type: string
 *                       fechaCreacion:
 *                         type: string
 *                         format: date-time
 *                       usuario:
 *                         type: string
 *                       sucursal:
 *                         type: string
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
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalComprobantes:
 *                       type: integer
 *                     pendientes:
 *                       type: integer
 *                     conError:
 *                       type: integer
 *                     rechazados:
 *                       type: integer
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: Sin permisos para consultar comprobantes de esta sucursal
 *       500:
 *         description: Error del servidor
 */
router.get('/comprobantes-no-enviados', verificarToken, ventaController.obtenerComprobantesNoEnviados);

/**
 * @swagger
 * /ventas/comprobantes-pendientes-rectificacion:
 *   get:
 *     summary: Obtener comprobantes pendientes de rectificación
 *     description: Obtiene una lista de comprobantes (facturas y boletas) que han sido rechazados por SUNAT o tienen errores y necesitan rectificación
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar (opcional)
 *         example: 1
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar (YYYY-MM-DD) (opcional)
 *         example: "2024-01-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar (YYYY-MM-DD) (opcional)
 *         example: "2024-12-31"
 *       - in: query
 *         name: tipoComprobante
 *         schema:
 *           type: string
 *           enum: [FACTURA, BOLETA]
 *         description: Tipo de comprobante para filtrar (opcional)
 *         example: "FACTURA"
 *       - in: query
 *         name: serie
 *         schema:
 *           type: string
 *         description: Serie del comprobante para filtrar (opcional)
 *         example: "FTR1"
 *       - in: query
 *         name: numero
 *         schema:
 *           type: string
 *         description: Número del comprobante para filtrar (opcional)
 *         example: "000001"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Número de página para paginación
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Cantidad de elementos por página
 *         example: 10
 *     responses:
 *       200:
 *         description: Lista de comprobantes pendientes de rectificación obtenida exitosamente
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
 *                         example: 123
 *                       entorno:
 *                         type: string
 *                         example: "PRODUCCIÓN"
 *                       usuario:
 *                         type: string
 *                         example: "Juan Pérez"
 *                       fechaEmision:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:30:00Z"
 *                       cliente:
 *                         type: string
 *                         example: "EMPRESA ABC S.A.C."
 *                       clienteDocumento:
 *                         type: string
 *                         example: "20123456789"
 *                       tipoComprobante:
 *                         type: string
 *                         example: "FACTURA"
 *                       comprobante:
 *                         type: string
 *                         example: "FTR1-000001"
 *                       descripcion:
 *                         type: string
 *                         example: "Comprobante rechazado por SUNAT"
 *                       estadoSunat:
 *                         type: string
 *                         enum: [RECHAZADO, ERROR]
 *                         example: "RECHAZADO"
 *                       motivoError:
 *                         type: string
 *                         example: "Error en datos del cliente"
 *                       total:
 *                         type: string
 *                         example: "118.00"
 *                       moneda:
 *                         type: string
 *                         example: "PEN"
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
 *                       example: 47
 *                     itemsPerPage:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalComprobantes:
 *                       type: integer
 *                       example: 47
 *                     rechazados:
 *                       type: integer
 *                       example: 30
 *                     conError:
 *                       type: integer
 *                       example: 17
 *                     facturas:
 *                       type: integer
 *                       example: 25
 *                     boletas:
 *                       type: integer
 *                       example: 22
 *                 mensaje:
 *                   type: string
 *                   example: "Comprobantes pendientes de rectificación obtenidos exitosamente"
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos para acceder a los datos
 *       500:
 *         description: Error interno del servidor
 */
router.get('/comprobantes-pendientes-rectificacion', verificarToken, ventaController.obtenerComprobantesPendientesRectificacion);

/**
 * @swagger
 * /ventas/reporte:
 *   get:
 *     summary: Obtener reporte de ventas
 *     description: Genera un reporte de ventas con filtros condicionales por sucursal, fecha, tipo de comprobante y método de pago
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar (opcional)
 *         example: 1
 *       - in: query
 *         name: fechaVenta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de venta para filtrar (YYYY-MM-DD) (opcional)
 *         example: "2024-08-19"
 *       - in: query
 *         name: tipoComprobante
 *         schema:
 *           type: string
 *           enum: [BOLETA, NOTA_VENTA, COTIZACION, GUIA_REMISION, FACTURA]
 *         description: Tipo de comprobante para filtrar (opcional)
 *         example: "BOLETA"
 *       - in: query
 *         name: metodoPago
 *         schema:
 *           type: string
 *           enum: [EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, YAPE, PLIN, CONTRAENTREGA]
 *         description: Método de pago para filtrar (opcional)
 *         example: "EFECTIVO"
 *     responses:
 *       200:
 *         description: Reporte de ventas generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 reporte:
 *                   type: object
 *                   properties:
 *                     sucursalId:
 *                       type: integer
 *                       nullable: true
 *                       description: ID de la sucursal filtrada (null si no se aplicó filtro)
 *                       example: 1
 *                     fechaVenta:
 *                       type: string
 *                       format: date
 *                       nullable: true
 *                       description: Fecha de venta filtrada (null si no se aplicó filtro)
 *                       example: "2024-08-19"
 *                     tipoComprobante:
 *                       type: string
 *                       nullable: true
 *                       description: Tipo de comprobante filtrado (null si no se aplicó filtro)
 *                       example: "BOLETA"
 *                     metodoPago:
 *                       type: string
 *                       nullable: true
 *                       description: Método de pago filtrado (null si no se aplicó filtro)
 *                       example: "EFECTIVO"
 *                     totalVentas:
 *                       type: integer
 *                       description: Total de ventas en el reporte
 *                       example: 25
 *                     montoTotal:
 *                       type: number
 *                       format: float
 *                       description: Monto total de las ventas
 *                       example: 15000.50
 *                     promedioVenta:
 *                       type: number
 *                       format: float
 *                       description: Promedio de venta
 *                       example: 600.02
 *                     ventasPorSucursal:
 *                       type: array
 *                       description: Agrupación por sucursal (solo para SuperAdmin sin filtro de sucursal)
 *                       items:
 *                         type: object
 *                         properties:
 *                           sucursal:
 *                             type: string
 *                             example: "Sucursal Principal"
 *                           totalVentas:
 *                             type: integer
 *                             example: 15
 *                           montoTotal:
 *                             type: number
 *                             format: float
 *                             example: 8500.25
 *                     ventasPorMetodoPago:
 *                       type: array
 *                       description: Agrupación por método de pago (solo cuando no se filtra por método específico)
 *                       items:
 *                         type: object
 *                         properties:
 *                           metodoPago:
 *                             type: string
 *                             example: "EFECTIVO"
 *                           totalVentas:
 *                             type: integer
 *                             example: 12
 *                           montoTotal:
 *                             type: number
 *                             format: float
 *                             example: 7200.00
 *                           porcentaje:
 *                             type: string
 *                             description: Porcentaje del total de ventas
 *                             example: "48.00"
 *                     ventas:
 *                       type: array
 *                       description: Lista detallada de ventas
 *                       items:
 *                         $ref: '#/components/schemas/Venta'
 *       400:
 *         description: Error en parámetros de entrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Método de pago inválido"
 *                 metodosValidos:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["EFECTIVO", "TARJETA_DEBITO", "TARJETA_CREDITO", "TRANSFERENCIA", "YAPE", "PLIN", "CONTRAENTREGA"]
 *       403:
 *         description: No tiene permisos para ver ventas de otras sucursales
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No se encontraron ventas para los criterios especificados
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No se encontraron ventas para los criterios especificados"
 *                 reporte:
 *                   type: object
 *                   properties:
 *                     sucursalId:
 *                       type: integer
 *                       nullable: true
 *                       example: 1
 *                     fechaVenta:
 *                       type: string
 *                       nullable: true
 *                       example: "2024-08-19"
 *                     tipoComprobante:
 *                       type: string
 *                       nullable: true
 *                       example: "BOLETA"
 *                     metodoPago:
 *                       type: string
 *                       nullable: true
 *                       example: "EFECTIVO"
 *                     totalVentas:
 *                       type: integer
 *                       example: 0
 *                     montoTotal:
 *                       type: number
 *                       example: 0
 *                     promedioVenta:
 *                       type: number
 *                       example: 0
 *                     ventasPorSucursal:
 *                       type: array
 *                       items:
 *                         type: object
 *                     ventasPorMetodoPago:
 *                       type: array
 *                       items:
 *                         type: object
 *                     ventas:
 *                       type: array
 *                       items:
 *                         type: object
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/reporte', verificarToken, ventaController.reporteVentas);







/**
 * @swagger
 * /ventas/{id}:
 *   get:
 *     summary: Obtener una venta por ID
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Detalles de la venta
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Venta'
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error del servidor
 */
/**
 * @swagger
 * /ventas:
 *   post:
 *     summary: Crear una nueva venta o cotización con integración SUNAT
 *     description: |
 *       Permite crear una nueva venta con los detalles proporcionados.
 *
 *       **COMPORTAMIENTO POR TIPO DE COMPROBANTE:**
 *       - **BOLETA, NOTA_VENTA, GUIA_REMISION, FACTURA**: Se crean como COMPLETADAS y actualizan el inventario inmediatamente
 *       - **COTIZACION**: Se crea como PENDIENTE y NO afecta el inventario (solo registra la cotización)
 *
 *       **INTEGRACIÓN SUNAT:**
 *       - Para FACTURA y BOLETA: Se envía automáticamente a SUNAT y se genera XML, CDR y PDF
 *       - Para otros tipos: No se envía a SUNAT
 *
 *       **PERMISOS:** El usuario debe tener permisos de SuperAdmin, Admin o Cajero para crear ventas.
 *
 *       **TIPOS DE COMPROBANTES DISPONIBLES:** BOLETA, NOTA_VENTA, COTIZACION, GUIA_REMISION, FACTURA
 *     tags:
 *       - Ventas
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sucursalId
 *               - tipoComprobante
 *               - serieComprobante
 *               - numeroComprobante
 *               - subtotal
 *               - igv
 *               - total
 *               - detalles
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: ID del cliente (opcional para ventas sin cliente específico)
 *                 example: 5
 *               sucursalId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la sucursal donde se realizó la venta
 *                 example: 1
 *               tipoComprobante:
 *                 $ref: '#/components/schemas/TipoComprobanteVenta'
 *               serieComprobante:
 *                 type: string
 *                 maxLength: 10
 *                 description: Serie del comprobante
 *                 example: "B001"
 *               numeroComprobante:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número del comprobante
 *                 example: "1234567"
 *               fechaVenta:
 *                 type: string
 *                 format: date-time
 *                 nullable: true
 *                 description: Fecha y hora de la venta (opcional, por defecto fecha actual)
 *                 example: "2023-01-01T00:00:00Z"
 *               fechaVencimiento:
 *                 type: string
 *                 format: date
 *                 nullable: true
 *                 description: Fecha de vencimiento para pagos a crédito (opcional)
 *                 example: "2025-02-21"
 *               subtotal:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Subtotal de la venta (sin IGV)
 *                 example: 100.00
 *               igv:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Impuesto al Valor Agregado (IGV)
 *                 example: 18.00
 *               total:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Total de la venta (incluyendo IGV)
 *                 example: 118.00
 *               observacion:
 *                 type: string
 *                 maxLength: 500
 *                 nullable: true
 *                 description: Observaciones sobre la venta (opcional)
 *                 example: "Venta al contado"
 *               metodoPago:
 *                 $ref: '#/components/schemas/MetodoPago'
 *               formaPago:
 *                 $ref: '#/components/schemas/FormaPago'
 *               moneda:
 *                 $ref: '#/components/schemas/Moneda'
 *               tallerId:
 *                 type: integer
 *                 minimum: 1
 *                 nullable: true
 *                 description: ID del taller asociado (opcional, para ventas que incluyen servicios de taller)
 *                 example: 3
 *               detalles:
 *                 type: array
 *                 minItems: 1
 *                 description: Detalles de la venta (debe incluir al menos un producto)
 *                 items:
 *                   $ref: '#/components/schemas/DetalleVenta'
 *           examples:
 *             venta_con_taller:
 *               summary: Venta con servicio de taller incluido
 *               value:
 *                 clienteId: 1
 *                 sucursalId: 1
 *                 tipoComprobante: "BOLETA"
 *                 serieComprobante: "B001"
 *                 numeroComprobante: "1234567"
 *                 fechaVenta: "2023-01-01T00:00:00Z"
 *                 subtotal: 150.00
 *                 igv: 27.00
 *                 total: 177.00
 *                 observacion: "Venta con servicio de mantenimiento"
 *                 metodoPago: "EFECTIVO"
 *                 formaPago: "CONTADO"
 *                 moneda: "PEN"
 *                 tallerId: 1
 *                 detalles:
 *                   - productoId: 12
 *                     cantidad: 10
 *                     precioUnitario: 10.00
 *                     subtotal: 100.00
 *             venta_a_credito:
 *               summary: Venta a crédito con fecha de vencimiento
 *               value:
 *                 clienteId: 1
 *                 sucursalId: 1
 *                 tipoComprobante: "BOLETA"
 *                 serieComprobante: "B001"
 *                 numeroComprobante: "0001000"
 *                 fechaVenta: "2025-01-22"
 *                 fechaVencimiento: "2025-02-21"
 *                 formaPago: "CREDITO"
 *                 metodoPago: "EFECTIVO"
 *                 moneda: "PEN"
 *                 detalles:
 *                   - productoId: 12
 *                     cantidad: 1
 *                     precioUnitario: 100.00
 *                     subtotal: 100.00
 *                 subtotal: 100.00
 *                 igv: 18.00
 *                 total: 118.00
 *     responses:
 *       201:
 *         description: Venta o cotización creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   description: Mensaje de confirmación
 *                   example: "Venta creada exitosamente"
 *                 venta:
 *                   $ref: '#/components/schemas/Venta'
 *                 esCotizacion:
 *                   type: boolean
 *                   description: Indica si el registro creado es una cotización
 *                   example: false
 *                 esFactura:
 *                   type: boolean
 *                   description: Indica si el registro creado es una factura
 *                   example: false
 *                 esBoleta:
 *                   type: boolean
 *                   description: Indica si el registro creado es una boleta
 *                   example: true
 *                 estadoSunat:
 *                   $ref: '#/components/schemas/EstadoSunat'
 *                 sunatError:
 *                   type: string
 *                   nullable: true
 *                   description: Mensaje de error de SUNAT (si hubo)
 *                   example: null
 *       400:
 *         description: Solicitud inválida - Datos incorrectos, faltantes o stock insuficiente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Token de autenticación no válido o ausente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Token de autenticación requerido"
 *       403:
 *         description: No tiene permisos para realizar ventas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Cliente, sucursal o producto no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al crear la venta"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */

router.post('/', [verificarToken, esAdminOSuperAdminOCajero], ventaController.crearVenta, middlewareContabilidadVenta);

/**
 * @swagger
 * /ventas/anular/{id}:
 *   put:
 *     summary: Anular una venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - motivoAnulacion
 *             properties:
 *               motivoAnulacion:
 *                 type: string
 *                 description: Motivo de la anulación
 *     responses:
 *       200:
 *         description: Venta anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 venta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     clienteId:
 *                       type: integer
 *                     sucursalId:
 *                       type: integer
 *                     usuarioId:
 *                       type: integer
 *                     tipoComprobante:
 *                       type: string
 *                     serieComprobante:
 *                       type: string
 *                     numeroComprobante:
 *                       type: string
 *                     fechaVenta:
 *                       type: string
 *                       format: date-time
 *                     subtotal:
 *                       type: string
 *                     igv:
 *                       type: string
 *                     total:
 *                       type: string
 *                     estado:
 *                       type: string
 *                     motivoAnulacion:
 *                       type: string
 *                     usuarioAnulacionId:
 *                       type: integer
 *                     fechaAnulacion:
 *                       type: string
 *                       format: date-time
 *                     observacion:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     clienteNombre:
 *                       type: string
 *                     usuarioNombre:
 *                       type: string
 *                     DetalleVenta:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           ventaId:
 *                             type: integer
 *                           productoId:
 *                             type: integer
 *                           cantidad:
 *                             type: integer
 *                           precioUnitario:
 *                             type: string
 *                           subtotal:
 *                             type: string
 *                           presentacionId:
 *                             type: integer
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *       403:
 *         description: No tiene permisos para anular ventas
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/anular/:id', [verificarToken, esAdminOSuperAdmin], ventaController.anularVenta);

/**
 * @swagger
 * /ventas/{id}/xml:
 *   get:
 *     summary: Descargar XML de una venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: XML descargado exitosamente
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *       404:
 *         description: Venta no encontrada o XML no disponible
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/xml', verificarToken, ventaController.descargarXML);

/**
 * @swagger
 * /ventas/{id}/cdr:
 *   get:
 *     summary: Descargar CDR de venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: CDR descargado exitosamente
 *         content:
 *           application/xml:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Venta no encontrada o CDR no disponible
 *       403:
 *         description: Sin permisos para acceder a la venta
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/cdr', verificarToken, ventaController.descargarCDR);

/**
 * @swagger
 * /ventas/{id}/pdf:
 *   get:
 *     summary: Descargar PDF de venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *       - in: query
 *         name: formato
 *         schema:
 *           type: string
 *           enum: [A4, ticket, 80mm]
 *           default: A4
 *         description: Formato del PDF
 *     responses:
 *       200:
 *         description: PDF descargado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Venta no encontrada
 *       403:
 *         description: Sin permisos para acceder a la venta
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/pdf', verificarToken, ventaController.descargarPDF);

/**
 * @swagger
 * /ventas/{id}/reenviar-sunat:
 *   post:
 *     summary: Reenviar venta a SUNAT
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Venta reenviada a SUNAT exitosamente
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.post('/:id/reenviar-sunat', [verificarToken, esAdminOSuperAdmin], ventaController.reenviarSunat);

/**
 * @swagger
 * /ventas/{id}/estado-sunat:
 *   get:
 *     summary: Obtener estado SUNAT de una venta
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     responses:
 *       200:
 *         description: Estado SUNAT obtenido exitosamente
 *       404:
 *         description: Venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id/estado-sunat', verificarToken, ventaController.obtenerEstadoSunat);

/**
 * @swagger
 * /ventas/cliente/{clienteId}:
 *   get:
 *     summary: Obtener historial de ventas por cliente
 *     tags: [Ventas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clienteId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         description: Período de consulta (Por mes, Por año, Todos)
 *       - in: query
 *         name: mes
 *         schema:
 *           type: string
 *         description: Mes específico (YYYY-MM)
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del rango
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del rango
 *     responses:
 *       200:
 *         description: Historial de ventas del cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       fecha:
 *                         type: string
 *                         format: date-time
 *                       tipoDocumento:
 *                         type: string
 *                       detalle:
 *                         type: string
 *                       estado:
 *                         type: string
 *                       monto:
 *                         type: string
 *                 total:
 *                   type: integer
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Cliente no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/cliente/:clienteId', verificarToken, ventaController.obtenerVentasPorCliente);

router.get('/:id', verificarToken, ventaController.obtenerVentaPorId);

// modelo de datos
/**
 * @swagger
 * components:
 *   schemas:
 *     TipoComprobanteVenta:
 *       type: string
 *       enum: [BOLETA, NOTA_VENTA, COTIZACION, GUIA_REMISION, FACTURA]
 *       description: Tipo de comprobante de venta
 *     MetodoPago:
 *       type: string
 *       enum: [EFECTIVO, TARJETA_DEBITO, TARJETA_CREDITO, TRANSFERENCIA, YAPE, PLIN, CONTRAENTREGA]
 *       description: Método de pago utilizado
 *     FormaPago:
 *       type: string
 *       enum: ['CONTADO', 'CREDITO']
 *       description: Forma de pago
 *     Moneda:
 *       type: string
 *       enum: ['PEN', 'USD']
 *       description: Tipo de moneda
 *     DetalleVenta:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         ventaId:
 *           type: integer
 *         productoId:
 *           type: integer
 *         cantidad:
 *           type: integer
 *         precioUnitario:
 *           type: string
 *         subtotal:
 *           type: string
 *         presentacionId:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     EstadoSunat:
 *       type: string
 *       enum: [PENDIENTE, ENVIADO, ACEPTADO, RECHAZADO]
 *       description: Estado del comprobante en SUNAT
 */

module.exports = router;