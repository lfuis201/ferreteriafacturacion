const express = require('express');
const router = express.Router();
const guiaRemisionController = require('../controllers/guiaRemision.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero, esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Guías de Remisión
 *   description: API para gestión de guías de remisión
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     GuiaRemision:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la guía de remisión
 *           example: 1
 *         clienteId:
 *           type: integer
 *           description: ID del cliente
 *           example: 5
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que crea la guía
 *           example: 1
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal
 *           example: 1
 *         serieComprobante:
 *           type: string
 *           description: Serie del comprobante
 *           example: "GR-1"
 *         numeroComprobante:
 *           type: string
 *           description: Número del comprobante
 *           example: "00000001"
 *         fechaSalida:
 *           type: string
 *           format: date-time
 *           description: Fecha de salida de la mercancía
 *           example: "2024-01-15T10:30:00Z"
 *         puntoPartida:
           type: string
           description: Punto de partida del traslado
           example: "Almacén principal"
         codigoUbigeoPartida:
           type: string
           description: Código de ubigeo del punto de partida
           example: "010101"
         puntoLlegada:
           type: string
           description: Punto de llegada del traslado
           example: "Av. Los Olivos 123, Lima"
         codigoUbigeoLlegada:
           type: string
           description: Código de ubigeo del punto de llegada
           example: "010102"
 *         motivoTraslado:
 *           type: string
 *           description: Motivo del traslado
 *           example: "Venta"
 *         nroPlaca:
 *           type: string
 *           description: Número de placa del vehículo
 *           example: "ABC-123"
 *         conductor:
 *           type: string
 *           description: Nombre del conductor
 *           example: "Juan Pérez"
 *         dniConductor:
 *           type: string
 *           description: DNI del conductor
 *           example: "12345678"
 *         estado:
 *           type: string
 *           enum: [emitida, en_transito, entregada, anulada]
 *           description: Estado de la guía
 *           example: "emitida"
 *         ventaId:
 *           type: integer
 *           description: ID de la venta asociada (opcional)
 *           example: 10
 *         observacion:
           type: string
           description: Observaciones adicionales
           example: "Entrega en horario de oficina"
         tipoTransporte:
           type: string
           enum: [privado, publico]
           description: Tipo de transporte utilizado
           example: "privado"
         marca:
           type: string
           description: Marca del vehículo (para transporte privado)
           example: "Toyota"
         modelo:
           type: string
           description: Modelo del vehículo (para transporte privado)
           example: "Hilux"
         rutaVehiculo:
           type: string
           description: Ruta del vehículo (para transporte público)
           example: "Lima - Callao"
         direccionFiscal:
           type: string
           description: Dirección fiscal de la empresa de transporte (para transporte público)
           example: "Av. Argentina 1234, Lima"
         codigoMTC:
           type: string
           description: Código MTC de la empresa de transporte (para transporte público)
           example: "MTC-12345"
 *     DetalleGuiaRemision:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del detalle
 *           example: 1
 *         guiaId:
 *           type: integer
 *           description: ID de la guía de remisión
 *           example: 1
 *         productoId:
 *           type: integer
 *           description: ID del producto
 *           example: 5
 *         presentacionId:
 *           type: integer
 *           description: ID de la presentación
 *           example: 2
 *         cantidad:
 *           type: number
 *           format: decimal
 *           description: Cantidad del producto
 *           example: 10.5
 *         descripcion:
 *           type: string
 *           description: Descripción del producto
 *           example: "Tornillo hexagonal 1/4"
 *     CrearGuiaRequest:
 *       type: object
 *       required:
 *         - fechaSalida
 *         - puntoPartida
 *         - puntoLlegada
 *         - motivoTraslado
 *         - detalles
 *       properties:
 *         clienteId:
 *           type: integer
 *           description: ID del cliente (opcional)
 *           example: 5
 *         fechaSalida:
 *           type: string
 *           format: date-time
 *           description: Fecha de salida
 *           example: "2024-01-15T10:30:00Z"
 *         puntoPartida:
           type: string
           description: Punto de partida
           example: "Almacén principal"
         codigoUbigeoPartida:
           type: string
           description: Código de ubigeo del punto de partida
           example: "010101"
         puntoLlegada:
           type: string
           description: Punto de llegada
           example: "Av. Los Olivos 123, Lima"
         codigoUbigeoLlegada:
           type: string
           description: Código de ubigeo del punto de llegada
           example: "010102"
 *         motivoTraslado:
 *           type: string
 *           description: Motivo del traslado
 *           example: "Venta"
 *         nroPlaca:
 *           type: string
 *           description: Número de placa
 *           example: "ABC-123"
 *         conductor:
 *           type: string
 *           description: Nombre del conductor
 *           example: "Juan Pérez"
 *         dniConductor:
 *           type: string
 *           description: DNI del conductor
 *           example: "12345678"
 *         observacion:
 *           type: string
 *           description: Observaciones
 *           example: "Entrega en horario de oficina"
 *         tipoTransporte:
 *           type: string
 *           enum: [privado, publico]
 *           description: Tipo de transporte
 *           example: "privado"
 *         marca:
 *           type: string
 *           description: Marca del vehículo (para transporte privado)
 *           example: "Toyota"
 *         modelo:
 *           type: string
 *           description: Modelo del vehículo (para transporte privado)
 *           example: "Hilux"
 *         rutaVehiculo:
 *           type: string
 *           description: Ruta del vehículo (para transporte público)
 *           example: "Lima - Callao"
 *         direccionFiscal:
 *           type: string
 *           description: Dirección fiscal de la empresa de transporte (para transporte público)
 *           example: "Av. Argentina 1234, Lima"
 *         codigoMTC:
 *           type: string
 *           description: Código MTC de la empresa de transporte (para transporte público)
 *           example: "MTC-12345"
 *         detalles:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               productoId:
 *                 type: integer
 *                 example: 5
 *               presentacionId:
 *                 type: integer
 *                 example: 2
 *               cantidad:
 *                 type: number
 *                 example: 10.5
 *               descripcion:
 *                 type: string
 *                 example: "Tornillo hexagonal 1/4"
 */

/**
 * @swagger
 * /guias-remision:
 *   get:
 *     summary: Obtener todas las guías de remisión
 *     tags: [Guías de Remisión]
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
 *           enum: [emitida, en_transito, entregada, anulada]
 *         description: Filtrar por estado
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
 *         name: ventaId
 *         schema:
 *           type: integer
 *         description: Filtrar por venta asociada
 *     responses:
 *       200:
 *         description: Lista de guías de remisión obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guiasRemision:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GuiaRemision'
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, guiaRemisionController.obtenerGuiasRemision);

/**
 * @swagger
 * /guias-remision/{id}:
 *   get:
 *     summary: Obtener una guía de remisión por ID
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     responses:
 *       200:
 *         description: Guía de remisión obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 guiaRemision:
 *                   $ref: '#/components/schemas/GuiaRemision'
 *       404:
 *         description: Guía de remisión no encontrada
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verificarToken, guiaRemisionController.obtenerGuiaRemisionPorId);

/**
 * @swagger
 * /guias-remision:
 *   post:
 *     summary: Crear una nueva guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CrearGuiaRequest'
 *           examples:
 *             ejemplo_completo:
 *               summary: Ejemplo completo de guía de remisión
 *               value:
 *                 clienteId: 5
 *                 fechaSalida: "2024-01-15T10:30:00Z"
 *                 puntoPartida: "Almacén principal"
                 codigoUbigeoPartida: "010101"
                 puntoLlegada: "Av. Los Olivos 123, Lima"
                 codigoUbigeoLlegada: "010102"
 *                 motivoTraslado: "Venta"
 *                 nroPlaca: "ABC-123"
 *                 conductor: "Juan Pérez"
 *                 dniConductor: "12345678"
 *                 observacion: "Entrega en horario de oficina"
 *                 tipoTransporte: "privado"
 *                 marca: "Toyota"
 *                 modelo: "Hilux"
 *                 detalles:
 *                   - productoId: 5
 *                     presentacionId: 2
 *                     cantidad: 10.5
 *                     descripcion: "Tornillo hexagonal 1/4"
 *                   - productoId: 8
 *                     presentacionId: 1
 *                     cantidad: 25
 *                     descripcion: "Tuerca hexagonal 1/4"
 *     responses:
 *       201:
 *         description: Guía de remisión creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión creada exitosamente"
 *                 guiaRemision:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     serieComprobante:
 *                       type: string
 *                       example: "GR-1"
 *                     numeroComprobante:
 *                       type: string
 *                       example: "00000001"
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.crearGuiaRemision);

/**
 * @swagger
 * /guias-remision/venta/{ventaId}:
 *   post:
 *     summary: Generar guía de remisión desde una venta
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: ventaId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la venta
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fechaSalida:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha de salida (opcional, por defecto fecha actual)
 *                 example: "2024-01-15T10:30:00Z"
 *               puntoPartida:
 *                 type: string
 *                 description: Punto de partida (opcional, por defecto "Almacén principal")
 *                 example: "Almacén principal"
 *               puntoLlegada:
 *                 type: string
 *                 description: Punto de llegada (opcional, toma dirección del cliente)
 *                 example: "Av. Los Olivos 123, Lima"
 *               motivoTraslado:
 *                 type: string
 *                 description: Motivo del traslado (opcional, por defecto "Venta")
 *                 example: "Venta"
 *               nroPlaca:
 *                 type: string
 *                 description: Número de placa del vehículo
 *                 example: "ABC-123"
 *               conductor:
 *                 type: string
 *                 description: Nombre del conductor
 *                 example: "Juan Pérez"
 *               dniConductor:
 *                 type: string
 *                 description: DNI del conductor
 *                 example: "12345678"
 *               observacion:
 *                 type: string
 *                 description: Observaciones adicionales
 *                 example: "Entrega en horario de oficina"
 *               tipoTransporte:
 *                 type: string
 *                 enum: [privado, publico]
 *                 description: Tipo de transporte
 *                 example: "privado"
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo (para transporte privado)
 *                 example: "Toyota"
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo (para transporte privado)
 *                 example: "Hilux"
 *               rutaVehiculo:
 *                 type: string
 *                 description: Ruta del vehículo (para transporte público)
 *                 example: "Lima - Callao"
 *               direccionFiscal:
 *                 type: string
 *                 description: Dirección fiscal de la empresa de transporte (para transporte público)
 *                 example: "Av. Argentina 1234, Lima"
 *               codigoMTC:
 *                 type: string
 *                 description: Código MTC de la empresa de transporte (para transporte público)
 *                 example: "MTC-12345"
 *     responses:
 *       201:
 *         description: Guía de remisión generada exitosamente desde la venta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión generada exitosamente desde la venta"
 *                 guiaRemision:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     serieComprobante:
 *                       type: string
 *                       example: "GR-1"
 *                     numeroComprobante:
 *                       type: string
 *                       example: "00000001"
 *       404:
 *         description: Venta no encontrada
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */
router.post('/venta/:ventaId', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.generarDesdeVenta);

/**
 * @swagger
 * /api/guias-remision/transportista:
 *   post:
 *     summary: Crear guía de remisión de transportista
 *     tags: [Guías de Remisión]
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
 *               - conductor
 *               - dniConductor
 *               - marca
 *               - modelo
 *               - rutaVehiculo
 *               - detalles
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *                 example: 5
 *               conductor:
 *                 type: string
 *                 description: Nombre del conductor
 *                 example: "Juan Pérez"
 *               dniConductor:
 *                 type: string
 *                 description: DNI del conductor
 *                 example: "12345678"
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo
 *                 example: "Toyota"
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo
 *                 example: "Hilux"
 *               rutaVehiculo:
 *                 type: string
 *                 description: Ruta del vehículo
 *                 example: "Lima - Arequipa"
 *               observacion:
 *                 type: string
 *                 description: Observaciones adicionales
 *                 example: "Entrega urgente"
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
 *                     descripcion:
 *                       type: string
 *                       example: "Cemento Portland"
 *     responses:
 *       201:
 *         description: Guía de remisión de transportista creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Guía de remisión de transportista creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/GuiaRemision'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/transportista', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.crearGuiaRemisionTransportista);

// Actualizar una guía de remisión
/**
 * @swagger
 * /guias-remision/{id}:
 *   put:
 *     summary: Actualizar una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *                 example: 1
 *               fechaSalida:
 *                 type: string
 *                 format: date-time
 *                 description: Fecha y hora de salida
 *                 example: "2024-01-15T10:30:00Z"
 *               puntoPartida:
                 type: string
                 description: Punto de partida del traslado
                 example: "Almacén Central - Lima"
               codigoUbigeoPartida:
                 type: string
                 description: Código de ubigeo del punto de partida
                 example: "010101"
               puntoLlegada:
                 type: string
                 description: Punto de llegada del traslado
                 example: "Cliente - Callao"
               codigoUbigeoLlegada:
                 type: string
                 description: Código de ubigeo del punto de llegada
                 example: "010102"
 *               transportistaId:
 *                 type: integer
 *                 description: ID del transportista
 *                 example: 1
 *               placaVehiculo:
 *                 type: string
 *                 description: Placa del vehículo
 *                 example: "ABC-123"
 *               licenciaConducir:
 *                 type: string
 *                 description: Licencia de conducir
 *                 example: "Q12345678"
 *               observacion:
 *                 type: string
 *                 description: Observaciones adicionales
 *                 example: "Entrega en horario de oficina"
 *               detalles:
 *                 type: array
 *                 description: Detalles de productos de la guía
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       description: ID del producto
 *                       example: 1
 *                     presentacionId:
 *                       type: integer
 *                       description: ID de la presentación
 *                       example: 1
 *                     cantidad:
 *                       type: number
 *                       format: decimal
 *                       description: Cantidad del producto
 *                       example: 10.50
 *                     descripcion:
 *                       type: string
 *                       description: Descripción del producto
 *                       example: "Producto en buen estado"
 *     responses:
 *       200:
 *         description: Guía de remisión actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión actualizada exitosamente"
 *                 guia:
 *                   $ref: '#/components/schemas/GuiaRemision'
 *       400:
 *         description: Error de validación o guía anulada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No se puede actualizar una guía de remisión anulada"
 *       401:
 *         description: No autorizado
 *       403:
 *         description: Sin permisos suficientes
 *       404:
 *         description: Guía de remisión no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión no encontrada"
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.actualizarGuiaRemision); 









/**
 * @swagger
 * /guias-remision/{id}/anular:
 *   put:
 *     summary: Anular una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
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
 *                 example: "Error en los datos del cliente"
 *     responses:
 *       200:
 *         description: Guía de remisión anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión anulada exitosamente"
 *       404:
 *         description: Guía de remisión no encontrada
 *       400:
 *         description: Motivo de anulación requerido o guía ya anulada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */



router.put('/:id/anular', [verificarToken, esAdminOSuperAdmin], guiaRemisionController.anularGuiaRemision);

/**
 * @swagger
 * /guias-remision/{id}/estado:
 *   put:
 *     summary: Cambiar estado de una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, En tránsito, Entregado, Anulado]
 *                 description: Nuevo estado de la guía
 *             required:
 *               - estado
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Guía de remisión no encontrada
 *       403:
 *         description: Sin permisos para modificar esta guía
 */
router.put('/:id/estado', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.cambiarEstadoGuia);

/**
 * @swagger
 * /guias-remision/{id}:
 *   delete:
 *     summary: Eliminar una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     responses:
 *       200:
 *         description: Guía eliminada correctamente
 *       400:
 *         description: Solo se pueden eliminar guías en estado Pendiente
 *       404:
 *         description: Guía de remisión no encontrada
 *       403:
 *         description: Sin permisos para eliminar esta guía
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.eliminarGuiaRemision);

/**
 * @swagger
 * /guias-remision/export/excel:
 *   get:
 *     summary: Exportar guías de remisión a Excel
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado de las guías
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
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       501:
 *         description: Funcionalidad en desarrollo
 */
router.get('/export/excel', verificarToken, guiaRemisionController.exportarExcel);

/**
 * @swagger
 * /guias-remision/{id}/pdf:
 *   get:
 *     summary: Generar PDF de una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Guía de remisión no encontrada
 *       501:
 *         description: Funcionalidad en desarrollo
 */
router.get('/:id/pdf', verificarToken, guiaRemisionController.generarPDF);

module.exports = router;
 
 

/**
 * @swagger
 * /api/guias-remision/transportista:
 *   post:
 *     summary: Crear guía de remisión de transportista
 *     tags: [Guías de Remisión]
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
 *               - conductor
 *               - dniConductor
 *               - marca
 *               - modelo
 *               - rutaVehiculo
 *               - detalles
 *             properties:
 *               clienteId:
 *                 type: integer
 *                 description: ID del cliente
 *                 example: 5
 *               conductor:
 *                 type: string
 *                 description: Nombre del conductor
 *                 example: "Juan Pérez"
 *               dniConductor:
 *                 type: string
 *                 description: DNI del conductor
 *                 example: "12345678"
 *               marca:
 *                 type: string
 *                 description: Marca del vehículo
 *                 example: "Toyota"
 *               modelo:
 *                 type: string
 *                 description: Modelo del vehículo
 *                 example: "Hilux"
 *               rutaVehiculo:
 *                 type: string
 *                 description: Ruta del vehículo
 *                 example: "Lima - Arequipa"
 *               observacion:
 *                 type: string
 *                 description: Observaciones adicionales
 *                 example: "Entrega urgente"
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
 *                     descripcion:
 *                       type: string
 *                       example: "Cemento Portland"
 *     responses:
 *       201:
 *         description: Guía de remisión de transportista creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Guía de remisión de transportista creada exitosamente"
 *                 data:
 *                   $ref: '#/components/schemas/GuiaRemision'
 *       400:
 *         description: Error de validación
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/transportista', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.crearGuiaRemisionTransportista);









/**
 * @swagger
 * /guias-remision/{id}/anular:
 *   put:
 *     summary: Anular una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
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
 *                 example: "Error en los datos del cliente"
 *     responses:
 *       200:
 *         description: Guía de remisión anulada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Guía de remisión anulada exitosamente"
 *       404:
 *         description: Guía de remisión no encontrada
 *       400:
 *         description: Motivo de anulación requerido o guía ya anulada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos suficientes
 *       500:
 *         description: Error interno del servidor
 */



router.put('/:id/anular', [verificarToken, esAdminOSuperAdmin], guiaRemisionController.anularGuiaRemision);

/**
 * @swagger
 * /guias-remision/{id}/estado:
 *   put:
 *     summary: Cambiar estado de una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [Pendiente, En tránsito, Entregado, Anulado]
 *                 description: Nuevo estado de la guía
 *             required:
 *               - estado
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *       400:
 *         description: Estado no válido
 *       404:
 *         description: Guía de remisión no encontrada
 *       403:
 *         description: Sin permisos para modificar esta guía
 */
router.put('/:id/estado', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.cambiarEstadoGuia);

/**
 * @swagger
 * /guias-remision/{id}:
 *   delete:
 *     summary: Eliminar una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     responses:
 *       200:
 *         description: Guía eliminada correctamente
 *       400:
 *         description: Solo se pueden eliminar guías en estado Pendiente
 *       404:
 *         description: Guía de remisión no encontrada
 *       403:
 *         description: Sin permisos para eliminar esta guía
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], guiaRemisionController.eliminarGuiaRemision);

/**
 * @swagger
 * /guias-remision/export/excel:
 *   get:
 *     summary: Exportar guías de remisión a Excel
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *         description: Estado de las guías
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
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       501:
 *         description: Funcionalidad en desarrollo
 */
router.get('/export/excel', verificarToken, guiaRemisionController.exportarExcel);

/**
 * @swagger
 * /guias-remision/{id}/pdf:
 *   get:
 *     summary: Generar PDF de una guía de remisión
 *     tags: [Guías de Remisión]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la guía de remisión
 *     responses:
 *       200:
 *         description: PDF generado
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Guía de remisión no encontrada
 *       501:
 *         description: Funcionalidad en desarrollo
 */
router.get('/:id/pdf', verificarToken, guiaRemisionController.generarPDF);

module.exports = router;
 
 
