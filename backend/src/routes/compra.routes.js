const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compra.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');
const multer = require('multer');
const { validarXmlCompra } = require('../middlewares/xmlValidator');
const upload = multer({ dest: 'uploads/' });



/**
 * @swagger
 * tags:
 *   name: Compras
 *   description: Operaciones relacionadas con compras, LOS TIPOS DE COMPROBANTES SON FACTURA ELECTRÓNICA, BOLETA DE VENTA ELECTRONICA, NOTA DE CREDITO, NOTA DE DEBITO, GUÍA, NOTA DE VENTA, RECIBO POR HONORARIOS, SERVICIOS PÚBLICOS.... ESTADO PENDIENTE, COMPLETADA Y ANULADA (10)
 */

/**
 * @swagger
 * /compras:
 *   get:
 *     summary: Obtener todas las compras
 *     description: Permite obtener una lista de todas las compras con filtros opcionales.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar compras
 *         example: 1
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, COMPLETADA, ANULADA]
 *         description: Estado de la compra para filtrar
 *         example: COMPLETADA
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar compras (formato YYYY-MM-DD)
 *         example: 2023-01-01
 *     responses:
 *       200:
 *         description: Lista de compras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compras:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Compra'
 *       403:
 *         description: No tiene permisos para ver las compras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para ver las compras"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al obtener las compras"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/', verificarToken, compraController.obtenerCompras);










/**
 * @swagger
 * /compras/reporte:
 *   get:
 *     summary: Obtener reporte de compras totales
 *     description: Genera un reporte completo de compras con estadísticas y filtros opcionales
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar compras
 *         example: 1
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, COMPLETADA, ANULADA, EN_PROCESO]
 *         description: Estado de la compra para filtrar
 *         example: COMPLETADA
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar compras (formato YYYY-MM-DD)
 *         example: "2024-01-01"
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar compras (formato YYYY-MM-DD)
 *         example: "2024-12-31"
 *       - in: query
 *         name: proveedorId
 *         schema:
 *           type: integer
 *         description: ID del proveedor para filtrar compras
 *         example: 5
 *     responses:
 *       200:
 *         description: Reporte de compras generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compras:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Compra'
 *                 estadisticas:
 *                   type: object
 *                   properties:
 *                     totalCompras:
 *                       type: integer
 *                       description: Número total de compras
 *                       example: 150
 *                     montoTotal:
 *                       type: number
 *                       format: float
 *                       description: Monto total de todas las compras
 *                       example: 25000.50
 *                     promedioPorCompra:
 *                       type: number
 *                       format: float
 *                       description: Promedio de monto por compra
 *                       example: 166.67
 *                     comprasPorEstado:
 *                       type: object
 *                       description: Cantidad de compras agrupadas por estado
 *                       example:
 *                         COMPLETADA: 120
 *                         PENDIENTE: 25
 *                         ANULADA: 5
 *                     comprasPorProveedor:
 *                       type: object
 *                       description: Estadísticas de compras agrupadas por proveedor
 *                       example:
 *                         "Proveedor ABC":
 *                           cantidad: 50
 *                           monto: 10000.00
 *                         "Proveedor XYZ":
 *                           cantidad: 30
 *                           monto: 7500.00
 *       403:
 *         description: Sin permisos para ver compras de otras sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para ver compras de otras sucursales"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al obtener el reporte de compras totales"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/reporte', verificarToken, compraController.obtenerReporteComprasTotales);









/**
 * @swagger
 * /compras/exportar-excel:
 *   get:
 *     summary: Exportar compras a Excel
 *     description: Permite exportar las compras a un archivo Excel con filtros opcionales.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar compras
 *         example: 1
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, COMPLETADA, ANULADA]
 *         description: Estado de la compra para filtrar
 *         example: COMPLETADA
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar compras (formato YYYY-MM-DD)
 *         example: 2023-01-01
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar compras (formato YYYY-MM-DD)
 *         example: 2023-12-31
 *       - in: query
 *         name: proveedorId
 *         schema:
 *           type: integer
 *         description: ID del proveedor para filtrar compras
 *         example: 1
 *     responses:
 *       200:
 *         description: Archivo Excel con las compras
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: No tiene permisos para exportar las compras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para exportar las compras"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al exportar las compras"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/exportar-excel', verificarToken, compraController.exportarComprasExcel);








/**
 * @swagger
 * components:
 *   schemas:
 *     TipoComprobante:
 *       type: string
 *       enum:
 *         - FACTURA
 *         - BOLETA
 *         - OTRO
 *       example: FACTURA
 *     EstadoCompra:
 *       type: string
 *       enum:
 *         - PENDIENTE
 *         - COMPLETADA
 *         - ANULADA
 *       example: PENDIENTE
 *     DetalleCompra:
 *       type: object
 *       required:
 *         - productoId
 *         - cantidad
 *         - precioUnitario
 *         - subtotal
 *       properties:
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *           example: 5
 *         cantidad:
 *           type: integer
 *           minimum: 1
 *           description: Cantidad comprada
 *           example: 10
 *         precioUnitario:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Precio unitario
 *           example: 10.00
 *         subtotal:
 *           type: number
 *           format: float
 *           minimum: 0
 *           description: Subtotal del detalle (cantidad × precioUnitario)
 *           example: 100.00
 *       additionalProperties: false
 *
 * /compras:
 *   post:
 *     summary: Crear una nueva compra
 *     description: Permite crear una nueva compra con los detalles proporcionados.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - proveedorId
 *               - sucursalId
 *               - tipoComprobante
 *               - subtotal
 *               - igv
 *               - total
 *               - detalles
 *             properties:
 *               proveedorId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID del proveedor
 *                 example: 5
 *               sucursalId:
 *                 type: integer
 *                 minimum: 1
 *                 description: ID de la sucursal donde se realizó la compra
 *                 example: 1
 *               tipoComprobante:
 *                 $ref: '#/components/schemas/TipoComprobante'
 *                 description: Tipo de comprobante de la compra
 *               serieComprobante:
 *                 type: string
 *                 maxLength: 10
 *                 description: Serie del comprobante (opcional)
 *                 example: "F001"
 *               numeroComprobante:
 *                 type: string
 *                 maxLength: 20
 *                 description: Número del comprobante (opcional)
 *                 example: "1234567"
 *               fechaCompra:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de la compra (opcional, por defecto fecha actual)
 *                 example: "2023-01-01T00:00:00Z"
 *               subtotal:
 *                 type: number
 *                 format: float
 *                 minimum: 0
 *                 description: Subtotal de la compra (sin IGV)
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
 *                 description: Total de la compra (incluyendo IGV)
 *                 example: 118.00
 *               estado:
 *                 $ref: '#/components/schemas/EstadoCompra'
 *                 description: Estado de la compra (opcional, por defecto PENDIENTE)
 *               observacion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Observaciones sobre la compra (opcional)
 *                 example: "Compra de productos para stock inicial"
 *               detalles:
 *                 type: array
 *                 minItems: 1
 *                 description: Detalles de la compra
 *                 items:
 *                   $ref: '#/components/schemas/DetalleCompra'
 *             additionalProperties: false
 *           examples:
 *             ejemplo_completo:
 *               summary: Ejemplo completo de compra
 *               value:
 *                 proveedorId: 5
 *                 sucursalId: 1
 *                 tipoComprobante: "FACTURA ELECTRÓNICA"
 *                 serieComprobante: "F001"
 *                 numeroComprobante: "1234567"
 *                 fechaCompra: "2023-01-01T00:00:00Z"
 *                 subtotal: 100.00
 *                 igv: 18.00
 *                 total: 118.00
 *                 estado: "PENDIENTE"
 *                 observacion: "Compra de productos para stock inicial"
 *                 detalles:
 *                   - productoId: 5
 *                     cantidad: 10
 *                     precioUnitario: 10.00
 *                     subtotal: 100.00
 *             ejemplo_minimo:
 *               summary: Ejemplo con campos mínimos requeridos
 *               value:
 *                 proveedorId: 3
 *                 sucursalId: 2
 *                 tipoComprobante: "BOLETA DE VENTA ELECTRONICA"
 *                 subtotal: 50.00
 *                 igv: 9.00
 *                 total: 59.00 
 *                 estado: "COMPLETADA"
 *                 detalles:
 *                   - productoId: 8
 *                     cantidad: 5
 *                     precioUnitario: 10.00
 *                     subtotal: 50.00
 *     responses:
 *       201:
 *         description: Compra creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra creada exitosamente"
 *                 compra:
 *                   $ref: '#/components/schemas/Compra'
 *             examples:
 *               success_response:
 *                 summary: Respuesta exitosa
 *                 value:
 *                   mensaje: "Compra creada exitosamente"
 *                   compra:
 *                     id: 123
 *                     proveedorId: 5
 *                     sucursalId: 1
 *                     tipoComprobante: "FACTURA ELECTRÓNICA"
 *                     serieComprobante: "F001"
 *                     numeroComprobante: "1234567"
 *                     fechaCompra: "2023-01-01T00:00:00Z"
 *                     subtotal: 100.00
 *                     igv: 18.00
 *                     total: 118.00
 *                     estado: "PENDIENTE"
 *                     observacion: "Compra de productos para stock inicial"
 *                     fechaCreacion: "2023-01-01T10:30:00Z"
 *                     fechaActualizacion: "2023-01-01T10:30:00Z"
 *       400:
 *         description: Solicitud inválida - Datos incorrectos o faltantes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error en los datos proporcionados"
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example:
 *                     - "El campo proveedorId es requerido"
 *                     - "El tipo de comprobante debe ser uno de: FACTURA ELECTRÓNICA, BOLETA DE VENTA ELECTRONICA, NOTA DE CREDITO, NOTA DE DEBITO, GUÍA, NOTA DE VENTA, RECIBO POR HONORARIOS, SERVICIOS PÚBLICOS"
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
 *         description: No tiene permisos para realizar compras
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para realizar compras"
 *       404:
 *         description: Proveedor o sucursal no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Proveedor no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al crear la compra"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */
router.post('/', [verificarToken, esAdminOSuperAdminOAlmacenero], compraController.crearCompra);

// Nuevo endpoint para Orden de Compra desde formulario del frontend
router.post('/orden', [verificarToken, esAdminOSuperAdminOAlmacenero], compraController.crearOrdenCompra);








/**
 * @swagger
 * /compras/{id}:
 *   get:
 *     summary: Obtener una compra por ID
 *     description: Permite obtener los detalles de una compra específica.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la compra que se desea obtener
 *         example: 1
 *     responses:
 *       200:
 *         description: Detalles de la compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 compra:
 *                   $ref: '#/components/schemas/Compra'
 *       403:
 *         description: No tiene permisos para ver esta compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para ver esta compra"
 *       404:
 *         description: La compra con el ID especificado no existe
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra no encontrada"
 *       500:
 *         description: Error interno del servidor al obtener la compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al obtener la compra"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/:id', verificarToken, compraController.obtenerCompraPorId);




















/**
 * @swagger
 * /compras/{id}/anular:
 *   put:
 *     summary: Anular una compra
 *     description: Permite anular una compra existente.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la compra que se desea anular
 *         example: 13
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observacion:
 *                 type: string
 *                 description: Observación sobre la anulación de la compra (opcional)
 *                 example: "Compra anulada por error en el comprobante"
 *     responses:
 *       200:
 *         description: Compra anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra anulada exitosamente"
 *                 compra:
 *                   $ref: '#/components/schemas/Compra'
 *       400:
 *         description: Solicitud inválida - La compra ya está anulada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "La compra ya está anulada"
 *       403:
 *         description: No tiene permisos para anular la compra
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para anular esta compra"
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al anular la compra"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */

/**
 * @swagger
 * /compras/{id}:
 *   patch:
 *     summary: Actualizar una compra
 *     description: Permite actualizar los datos de una compra existente. Solo se pueden actualizar compras que no estén anuladas.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compra a actualizar
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               tipoComprobante:
 *                 type: string
 *                 example: "FACTURA ELECTRONICA"
 *               serie:
 *                 type: string
 *                 example: "F001"
 *               numeroComprobante:
 *                 type: string
 *                 example: "00000123"
 *               fechaCompra:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               fechaVencimiento:
 *                 type: string
 *                 format: date
 *                 example: "2024-02-15"
 *               proveedorId:
 *                 type: integer
 *                 example: 1
 *               moneda:
 *                 type: string
 *                 example: "Soles"
 *               tipoCambio:
 *                 type: string
 *                 example: "3.510"
 *               condicionPago:
 *                 type: string
 *                 example: "Contado"
 *               clienteId:
 *                 type: integer
 *                 example: 1
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       example: 1
 *                     cantidad:
 *                       type: number
 *                       example: 10
 *                     precioUnitario:
 *                       type: number
 *                       example: 25.50
 *               pagos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     formaPago:
 *                       type: string
 *                       example: "Efectivo"
 *                     monto:
 *                       type: number
 *                       example: 255.00
 *                     referencia:
 *                       type: string
 *                       example: "REF001"
 *                     glosa:
 *                       type: string
 *                       example: "Pago completo"
 *     responses:
 *       200:
 *         description: Compra actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra actualizada exitosamente"
 *                 compra:
 *                   type: object
 *                   description: Datos de la compra actualizada
 *       400:
 *         description: Error de validación o compra anulada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No se puede actualizar una compra anulada"
 *       403:
 *         description: Sin permisos para actualizar compras de otras sucursales
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para actualizar compras de otras sucursales"
 *       404:
 *         description: Compra no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error interno del servidor al actualizar la compra"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.patch('/:id', [verificarToken, esAdminOSuperAdmin], compraController.actualizarCompra);



















router.put('/:id/anular', [verificarToken, esAdminOSuperAdmin], compraController.anularCompra);

/**
 * @swagger
 * /compras/upload-xml:
 *   post:
 *     summary: Subir archivo XML de compra
 *     description: Permite subir un archivo XML de compra del proveedor para procesarlo y generar CDR y PDF
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - xmlFile
 *               - compraId
 *             properties:
 *               xmlFile:
 *                 type: string
 *                 format: binary
 *                 description: Archivo XML de la compra
 *               compraId:
 *                 type: integer
 *                 description: ID de la compra existente
 *                 example: 123
 *     responses:
 *       200:
 *         description: XML procesado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "XML procesado exitosamente"
 *                 compra:
 *                   $ref: '#/components/schemas/Compra'
 *                 cdrStatus:
 *                   type: string
 *                   example: "ACEPTADO"
 *                 pdfUrl:
 *                   type: string
 *                   example: "/files/compra-123.pdf"
 *       400:
 *         description: Error en el archivo XML o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Archivo XML inválido"
 *                 error:
 *                   type: string
 *       401:
 *         description: No autorizado
 *       404:
 *         description: Compra no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.post('/upload-xml', [verificarToken, esAdminOSuperAdminOAlmacenero, upload.single('xmlFile'), validarXmlCompra], compraController.uploadXml);

/**
 * @swagger
 * /compras/upload-xml-auto:
 *   post:
 *     summary: Subir archivo XML de compra y crear compra automáticamente
 *     description: Permite subir un archivo XML de compra del proveedor y crear automáticamente la compra, proveedor (si no existe) y actualizar inventario.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               xmlFile:
 *                 type: string
 *                 format: binary
 *                 description: Archivo XML de la compra
 *             required:
 *               - xmlFile
 *     responses:
 *       200:
 *         description: XML procesado exitosamente y compra creada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra creada y XML procesado exitosamente"
 *                 compra:
 *                   $ref: '#/components/schemas/Compra'
 *                 procesamiento:
 *                   type: object
 *                   properties:
 *                     estadoSunat:
 *                       type: string
 *                       example: "ACEPTADO"
 *                     observaciones:
 *                       type: array
 *                       items:
 *                         type: string
 *                     datosComprobante:
 *                       type: object
 *                 inventario:
 *                   type: object
 *                   description: Información del procesamiento de inventario
 *                 pdfUrl:
 *                   type: string
 *                   example: "http://localhost:4000/files/compra-123-timestamp.pdf"
 *       400:
 *         description: Error en el archivo XML o procesamiento
 *       403:
 *         description: No tiene permisos para subir archivos XML
 *       500:
 *         description: Error interno del servidor
 */
router.post('/upload-xml-auto', [verificarToken, esAdminOSuperAdminOAlmacenero, upload.single('xmlFile'), validarXmlCompra], compraController.uploadXmlAuto);

/**
 * @swagger
 * /compras/{id}/pdf:
 *   get:
 *     summary: Descargar PDF de compra generado
 *     description: Permite descargar el archivo PDF generado a partir del XML procesado
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compra
 *     responses:
 *       200:
 *         description: PDF descargado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Compra no encontrada o PDF no disponible
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/pdf', verificarToken, compraController.descargarPdf);

/**
 * @swagger
 * /compras/{id}:
 *   delete:
 *     summary: Eliminar una compra
 *     description: Permite eliminar una compra específica por su ID.
 *     tags: [Compras]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la compra a eliminar
 *     responses:
 *       200:
 *         description: Compra eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Compra eliminada exitosamente"
 *       404:
 *         description: Compra no encontrada
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdmin], compraController.eliminarCompra);

module.exports = router;