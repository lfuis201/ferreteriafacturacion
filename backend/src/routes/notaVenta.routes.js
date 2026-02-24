const express = require('express');
const router = express.Router();
const notaVentaController = require('../controllers/notaVenta.controller');
const { verificarToken } = require('../middlewares/authMiddleware');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero } = require('../middlewares/roleMiddleware');



/**
 * @swagger
 * tags:
 *   name: Notas de Venta
 *   description: API para gestión de notas de venta(13)
 */



/**
 * @swagger
 * /notas-venta:
 *   get:
 *     summary: Obtener todas las notas de venta
 *     tags: [Notas de Venta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: ['emitida', 'anulada']
 *         description: Filtrar por estado
 *     responses:
 *       200:
 *         description: Lista de notas de venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notasVenta:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NotaVenta'
 *                 metadatos:
 *                   type: object
 *                   properties:
 *                     totalNotasVenta:
 *                       type: integer
 *                     notasPorEstado:
 *                       type: object
 *                       additionalProperties:
 *                         type: integer
 *                     montoTotal:
 *                       type: number
 *                       format: float
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, notaVentaController.obtenerNotasVenta);

/**
 * @swagger
 * /notas-venta/{id}:
 *   get:
 *     summary: Obtener una nota de venta por ID
 *     tags: [Notas de Venta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la nota de venta
 *     responses:
 *       200:
 *         description: Nota de venta encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotaVenta'
 *       404:
 *         description: Nota de venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, notaVentaController.obtenerNotaVentaPorId);

// Descargar PDF de Nota de Venta (A4 o Ticket 80mm)
router.get('/:id/pdf', verificarToken, notaVentaController.descargarPDF);

/**
 * @swagger
 * /notas-venta:
 *   post:
 *     summary: Crear una nueva nota de venta
 *     tags: [Notas de Venta]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clienteId
 *               - detalles
 *               - subtotal
 *               - igv
 *               - total
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       description: ID del producto
 *                     cantidad:
 *                       type: number
 *                       format: float
 *                       description: Cantidad del producto
 *                     precioUnitario:
 *                       type: number
 *                       format: float
 *                       description: Precio unitario del producto
 *                     subtotal:
 *                       type: number
 *                       format: float
 *                       description: Subtotal del detalle
 *               subtotal:
 *                 type: number
 *                 format: float
 *                 description: Subtotal de la nota de venta
 *               igv:
 *                 type: number
 *                 format: float
 *                 description: IGV de la nota de venta
 *               total:
 *                 type: number
 *                 format: float
 *                 description: Total de la nota de venta
 *               observacion:
 *                 type: string
 *                 description: Observaciones sobre la nota de venta
 *               actualizarInventario:
 *                 type: boolean
 *                 description: Indica si se debe actualizar el inventario (opcional, por defecto es false)
 *               sucursalId:
 *                 type: integer
 *                 description: Opcional para SuperAdmin. Si no se especifica, se usa la primera sucursal disponible. Para otros roles se obtiene automáticamente del token JWT.
 *             note: |
 *               El campo sucursalId es opcional para SuperAdmin y se obtiene automáticamente
 *               del usuario autenticado a través del token JWT para otros roles.
 *           example:
 *             clienteId: 1
 *             detalles:
 *               - productoId: 1
 *                 cantidad: 2
 *                 precioUnitario: 50.00
 *                 subtotal: 100.00
 *               - productoId: 2
 *                 cantidad: 1
 *                 precioUnitario: 30.00
 *                 subtotal: 30.00
 *             subtotal: 130.00
 *             igv: 23.40
 *             total: 153.40
 *             observacion: Nota de venta de prueba sin actualización de inventario
 *             actualizarInventario: false
 *     responses:
 *       201:
 *         description: Nota de venta creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 notaVenta:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     serieComprobante:
 *                       type: string
 *                     numeroComprobante:
 *                       type: string
 *                     clienteId:
 *                       type: integer
 *                     clienteNombre:
 *                       type: string
 *                     usuarioId:
 *                       type: integer
 *                     usuarioNombre:
 *                       type: string
 *       500:
 *         description: Error del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOCajero], notaVentaController.crearNotaVenta);

/**
 * @swagger
 * /notas-venta/{id}/anular:
 *   put:
 *     summary: Anular una nota de venta
 *     tags: [Notas de Venta]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la nota de venta
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
 *               revertirInventario:
 *                 type: boolean
 *                 description: Indica si se debe revertir el inventario
 *     responses:
 *       200:
 *         description: Nota de venta anulada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 notaVenta:
 *                   $ref: '#/components/schemas/NotaVenta'
 *       400:
 *         description: Error en la solicitud
 *       404:
 *         description: Nota de venta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id/anular', [verificarToken, esAdminOSuperAdmin], notaVentaController.anularNotaVenta);

module.exports = router;