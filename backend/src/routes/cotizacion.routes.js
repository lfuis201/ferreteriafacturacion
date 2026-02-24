const express = require('express');
const router = express.Router();
const cotizacionController = require('../controllers/cotizacion.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero } = require('../middlewares/roleMiddleware');













/**
 * @swagger
 * tags:
 *   name: Cotizaciones
 *   description: API para gestionar cotizaciones (12)
 */

/**
 * @swagger
 * /cotizaciones:
 *   get:
 *     summary: Obtener todas las cotizaciones
 *     tags: [Cotizaciones]
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
 *           enum: [pendiente, aceptada, rechazada]
 *         description: Filtrar por estado
 *       - in: query
 *         name: fecha
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha para filtrar (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Lista de cotizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cotizacion'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, cotizacionController.obtenerCotizaciones);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   get:
 *     summary: Obtener una cotización por ID
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la cotización
 *     responses:
 *       200:
 *         description: Cotización encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Cotizacion'
 *       404:
 *         description: Cotización no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, cotizacionController.obtenerCotizacionPorId);

// Generar PDF de una cotización
router.get('/:id/pdf', verificarToken, cotizacionController.generarPDFCotizacion);

/**
 * @swagger
 * /cotizaciones:
 *   post:
 *     summary: Crear una nueva cotización
 *     tags: [Cotizaciones]
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
 *                     presentacionId:
 *                       type: integer
 *                       description: ID de la presentación
 *                     cantidad:
 *                       type: integer
 *                       description: Cantidad del producto
 *                     precioUnitario:
 *                       type: number
 *                       format: float
 *                       description: Precio unitario del producto
 *                     subtotal:
 *                       type: number
 *                       format: float
 *                       description: Subtotal del detalle
 *                     descripcion:
 *                       type: string
 *                       description: Descripción del detalle
 *               subtotal:
 *                 type: number
 *                 format: float
 *                 description: Subtotal de la cotización
 *               igv:
 *                 type: number
 *                 format: float
 *                 description: IGV de la cotización
 *               total:
 *                 type: number
 *                 format: float
 *                 description: Total de la cotización
 *               observacion:
 *                 type: string
 *                 description: Observaciones sobre la cotización
 *               validezDias:
 *                 type: integer
 *                 description: Días de validez de la cotización
 *           example:
 *             clienteId: 1
 *             detalles:
 *               - productoId: 1
 *                 presentacionId: 1
 *                 cantidad: 2
 *                 precioUnitario: 50.00
 *                 subtotal: 100.00
 *                 descripcion: Producto de prueba
 *               - productoId: 2
 *                 presentacionId: 2
 *                 cantidad: 1
 *                 precioUnitario: 30.00
 *                 subtotal: 30.00
 *                 descripcion: Otro producto de prueba
 *             subtotal: 130.00
 *             igv: 23.40
 *             total: 153.40
 *             observacion: Cotización de prueba
 *             validezDias: 15
 *     responses:
 *       201:
 *         description: Cotización creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 cotizacion:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     numeroReferencia:
 *                       type: string
 *       500:
 *         description: Error del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOCajero], cotizacionController.crearCotizacion);

/**
 * @swagger
 * components:
 *   schemas:
 *     EstadoCotizacion:
 *       type: string
 *       enum:
 *         - pendiente
 *         - aceptada
 *         - rechazada
 *       example: aceptada
 *       description: Estado de la cotización
 * 
 * /cotizaciones/{id}/estado:
 *   put:
 *     summary: Actualizar el estado de una cotización
 *     description: |
 *       Permite actualizar el estado de una cotización existente.
 *       
 *       **Estados disponibles:**
 *       - **pendiente**: Cotización en espera de respuesta
 *       - **aceptada**: Cotización aprobada por el cliente
 *       - **rechazada**: Cotización rechazada por el cliente
 *       
 *       Solo usuarios con permisos de SuperAdmin, Admin o Cajero pueden actualizar estados de cotizaciones.
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la cotización a actualizar
 *         example: 123
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - estado
 *             properties:
 *               estado:
 *                 $ref: '#/components/schemas/EstadoCotizacion'
 *                 description: Nuevo estado de la cotización
 *               observacion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Observaciones adicionales sobre el cambio de estado (opcional)
 *                 example: "Cliente solicita modificaciones en la propuesta"
 *             additionalProperties: false
 *           examples:
 *             aceptar_cotizacion:
 *               summary: Aceptar cotización
 *               value:
 *                 estado: "aceptada"
 *                 observacion: "Cliente aprobó la cotización y procederá con la compra"
 *             rechazar_cotizacion:
 *               summary: Rechazar cotización
 *               value:
 *                 estado: "rechazada"
 *                 observacion: "Cliente decidió no proceder con la compra por presupuesto"
 *             pendiente_cotizacion:
 *               summary: Marcar como pendiente
 *               value:
 *                 estado: "pendiente"
 *                 observacion: "Cliente necesita más tiempo para decidir"
 *             sin_observacion:
 *               summary: Cambio de estado sin observación
 *               value:
 *                 estado: "aceptada"
 *     responses:
 *       200:
 *         description: Estado de cotización actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Estado de cotización actualizado exitosamente"
 *                 cotizacion:
 *                   $ref: '#/components/schemas/Cotizacion'
 *             examples:
 *               success_response:
 *                 summary: Actualización exitosa
 *                 value:
 *                   mensaje: "Estado de cotización actualizado exitosamente"
 *                   cotizacion:
 *                     id: 123
 *                     clienteId: 5
 *                     sucursalId: 1
 *                     usuarioId: 10
 *                     tipoComprobante: "COTIZACION"
 *                     serieComprobante: "COT001"
 *                     numeroComprobante: "4567890"
 *                     fechaVenta: "2023-01-01T00:00:00Z"
 *                     subtotal: 200.00
 *                     igv: 36.00
 *                     total: 236.00
 *                     estado: "aceptada"
 *                     observacion: "Cliente aprobó la cotización y procederá con la compra"
 *                     fechaCreacion: "2023-01-01T10:30:00Z"
 *                     fechaActualizacion: "2023-01-01T11:45:00Z"
 *       400:
 *         description: Solicitud inválida - Estado no válido o datos incorrectos
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
 *             examples:
 *               estado_invalido:
 *                 summary: Estado no válido
 *                 value:
 *                   mensaje: "Estado no válido"
 *                   errores:
 *                     - "El estado debe ser: pendiente, aceptada o rechazada"
 *               datos_faltantes:
 *                 summary: Datos requeridos faltantes
 *                 value:
 *                   mensaje: "Datos requeridos faltantes"
 *                   errores:
 *                     - "El campo estado es requerido"
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
 *         description: No tiene permisos para actualizar cotizaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para actualizar cotizaciones"
 *       404:
 *         description: Cotización no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Cotización no encontrada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al actualizar el estado de la cotización"
 *                 error:
 *                   type: string
 *                   example: "Error de conexión a la base de datos"
 */
router.put('/:id/estado', [verificarToken, esAdminOSuperAdminOCajero], cotizacionController.actualizarEstadoCotizacion);




/**
 * @swagger
 * /cotizaciones/{id}:
 *   put:
 *     summary: Actualizar una cotización completa
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la cotización
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *               fechaEntrega:
 *                 type: string
 *                 format: date
 *               registradoPor:
 *                 type: string
 *               vendedor:
 *                 type: string
 *               cliente:
 *                 type: string
 *               comprobantes:
 *                 type: string
 *               notasDeVenta:
 *                 type: string
 *               pedido:
 *                 type: string
 *               oportunidadVenta:
 *                 type: string
 *               infReferencial:
 *                 type: string
 *               contrato:
 *                 type: string
 *               tipoCambio:
 *                 type: string
 *               moneda:
 *                 type: string
 *               tExportacion:
 *                 type: number
 *               tGratuito:
 *                 type: number
 *               tInafecta:
 *                 type: number
 *               tExonerado:
 *                 type: number
 *               tGravado:
 *                 type: number
 *               subtotal:
 *                 type: number
 *               igv:
 *                 type: number
 *               total:
 *                 type: number
 *               estado:
 *                 type: string
 *               observacion:
 *                 type: string
 *               validezDias:
 *                 type: integer
 *               productos:
 *                 type: array
 *               pagos:
 *                 type: array
 *               detalles:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                     cantidad:
 *                       type: number
 *                     precioUnitario:
 *                       type: number
 *                     subtotal:
 *                       type: number
 *                     descripcion:
 *                       type: string
 *     responses:
 *       200:
 *         description: Cotización actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 cotizacion:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     numeroReferencia:
 *                       type: string
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Cotización no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOCajero], cotizacionController.actualizarCotizacion);

/**
 * @swagger
 * /cotizaciones/{id}:
 *   delete:
 *     summary: Eliminar una cotización
 *     tags: [Cotizaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la cotización
 *     responses:
 *       200:
 *         description: Cotización eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Cotización no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdmin], cotizacionController.eliminarCotizacion);

module.exports = router;