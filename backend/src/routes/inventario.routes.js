const express = require('express');
const router = express.Router();
const inventarioController = require('../controllers/inventario.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');

/**
 * @swagger
 * tags:
 *   name: Inventario
 *   description: API para gestionar inventarios(9)
 */

/**
 * @swagger
 * /inventario/sucursal/{sucursalId}:
 *   get:
 *     summary: Obtener inventario por sucursal
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Inventario de la sucursal
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       500:
 *         description: Error al obtener inventario
 */
router.get('/sucursal/:sucursalId', verificarToken, inventarioController.obtenerInventarioPorSucursal);

/**
 * @swagger
 * /inventario:
 *   get:
 *     summary: Obtener inventario con filtros
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         description: ID del producto
 *       - in: query
 *         name: stockMinimo
 *         schema:
 *           type: boolean
 *         description: Filtrar productos con stock bajo
 *     responses:
 *       200:
 *         description: Inventario filtrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inventario:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Inventario'
 *       500:
 *         description: Error al obtener inventario
 */
router.get('/', verificarToken, inventarioController.obtenerInventario);

/**
 * @swagger
 * /inventario/producto/{productoId}:
 *   get:
 *     summary: Obtener inventario por producto
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Inventario del producto
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Inventario'
 *       500:
 *         description: Error al obtener inventario
 */
router.get('/producto/:productoId', verificarToken, inventarioController.obtenerInventarioPorProducto);

/**
 * @swagger
 * /inventario/stock/{productoId}/{sucursalId}:
 *   put:
 *     summary: Actualizar stock de un producto en una sucursal
 *     description: Permite actualizar el stock, stock mínimo y precio de venta de un producto en una sucursal específica. Registra automáticamente los movimientos de inventario.
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *         example: 5
 *       - in: path
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stock:
 *                 type: number
 *                 format: float
 *                 description: Nuevo stock del producto (genera movimiento de inventario si cambia)
 *                 example: 50
 *               stockMinimo:
 *                 type: number
 *                 format: float
 *                 description: Stock mínimo permitido para alertas
 *                 example: 10
 *               precioVenta:
 *                 type: number
 *                 format: float
 *                 description: Precio específico para esta sucursal (opcional)
 *                 example: 15.99
 *             additionalProperties: false
 *           examples:
 *             ajuste_completo:
 *               summary: Ajuste completo con todos los campos
 *               value:
 *                 stock: 50
 *                 stockMinimo: 10
 *                 precioVenta: 15.99
 *             solo_stock:
 *               summary: Solo actualizar stock
 *               value:
 *                 stock: 25
 *                 stockMinimo: 5
 *             solo_precio:
 *               summary: Solo actualizar precio
 *               value:
 *                 precioVenta: 18.50
 *             crear_inventario:
 *               summary: Crear inventario nuevo
 *               value:
 *                 stock: 100
 *                 stockMinimo: 15
 *                 precioVenta: 12.75
 *     responses:
 *       200:
 *         description: Inventario actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Inventario actualizado exitosamente"
 *                 inventario:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del inventario
 *                       example: 1
 *                     productoId:
 *                       type: integer
 *                       description: ID del producto
 *                       example: 1
 *                     sucursalId:
 *                       type: integer
 *                       description: ID de la sucursal
 *                       example: 1
 *                     stock:
 *                       type: number
 *                       format: float
 *                       description: Cantidad en stock
 *                       example: 100.00
 *                     stockMinimo:
 *                       type: number
 *                       format: float
 *                       description: Stock mínimo permitido
 *                       example: 5.00
 *                     precioVenta:
 *                       type: number
 *                       format: float
 *                       description: Precio específico para esta sucursal (opcional)
 *                       example: 10.99
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de creación del inventario
 *                       example: 2023-01-01T00:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha de actualización del inventario
 *                       example: 2023-01-01T00:00:00Z
 *       403:
 *         description: No tiene permisos para actualizar el stock
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para actualizar el stock"
 *       404:
 *         description: Producto o sucursal no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "El producto no existe o está inactivo"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al actualizar el inventario"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.put('/stock/:productoId/:sucursalId', [verificarToken, esAdminOSuperAdminOAlmacenero], inventarioController.actualizarStock);

/**
 * @swagger
 * /inventario/traslado:
 *   post:
 *     summary: Realizar un traslado de productos entre sucursales
 *     description: Permite realizar un traslado de productos entre sucursales, actualizando automáticamente los inventarios y registrando el movimiento.
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - sucursalOrigenId
 *               - sucursalDestinoId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *                 description: ID del producto a trasladar
 *                 example: 5
 *               sucursalOrigenId:
 *                 type: integer
 *                 description: ID de la sucursal de origen
 *                 example: 1
 *               sucursalDestinoId:
 *                 type: integer
 *                 description: ID de la sucursal de destino
 *                 example: 2
 *               cantidad:
 *                 type: integer
 *                 description: Cantidad de productos a trasladar
 *                 example: 10
 *               observacion:
 *                 type: string
 *                 description: Observaciones sobre el traslado (opcional)
 *                 example: Traslado de productos por pedido especial
 *             additionalProperties: false
 *     responses:
 *       200:
 *         description: Traslado realizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Traslado realizado exitosamente"
 *                 movimiento:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID del movimiento
 *                       example: 1
 *                     productoId:
 *                       type: integer
 *                       description: ID del producto
 *                       example: 5
 *                     sucursalOrigenId:
 *                       type: integer
 *                       description: ID de la sucursal de origen
 *                       example: 1
 *                     sucursalDestinoId:
 *                       type: integer
 *                       description: ID de la sucursal de destino
 *                       example: 2
 *                     tipoMovimiento:
 *                       type: string
 *                       enum: [TRASLADO]
 *                       description: Tipo de movimiento
 *                       example: TRASLADO
 *                     cantidad:
 *                       type: integer
 *                       description: Cantidad de productos
 *                       example: 10
 *                     precioUnitario:
 *                       type: number
 *                       format: float
 *                       description: Precio unitario en el momento del movimiento
 *                       example: 15.99
 *                     documentoRelacionadoTipo:
 *                       type: string
 *                       description: Tipo de documento relacionado
 *                       example: TRASLADO
 *                     documentoRelacionadoId:
 *                       type: integer
 *                       description: ID del documento relacionado (opcional)
 *                       example: null
 *                     usuarioId:
 *                       type: integer
 *                       description: ID del usuario que realizó el movimiento
 *                       example: 95
 *                     observacion:
 *                       type: string
 *                       description: Observaciones sobre el movimiento
 *                       example: Traslado entre sucursales
 *                     autorizado:
 *                       type: boolean
 *                       description: Indica si el movimiento fue autorizado
 *                       example: true
 *                     autorizadoPorId:
 *                       type: integer
 *                       description: ID del usuario que autorizó el movimiento (opcional)
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de creación
 *                       example: 2023-01-01T00:00:00Z
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Fecha y hora de última actualización
 *                       example: 2023-01-01T00:00:00Z
 *       400:
 *         description: Solicitud inválida
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No hay suficiente stock en la sucursal de origen"
 *       403:
 *         description: No tiene permisos para realizar el traslado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No tiene permisos para realizar traslados"
 *       404:
 *         description: Recurso no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "El producto no existe o está inactivo"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al realizar el traslado"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.post('/traslado', [verificarToken, esAdminOSuperAdminOAlmacenero], inventarioController.realizarTraslado);



/**
 * @swagger
 * /inventario/movimientos:
 *   get:
 *     summary: Obtener todos los movimientos de inventario
 *     description: Permite obtener una lista de todos los movimientos de inventario con información detallada.
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de movimientos de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 movimientos:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID del movimiento
 *                         example: 1
 *                       productoId:
 *                         type: integer
 *                         description: ID del producto
 *                         example: 5
 *                       sucursalOrigenId:
 *                         type: integer
 *                         description: ID de la sucursal de origen
 *                         example: 1
 *                       sucursalDestinoId:
 *                         type: integer
 *                         description: ID de la sucursal de destino
 *                         example: 1
 *                       tipoMovimiento:
 *                         type: string
 *                         enum: [ENTRADA, SALIDA, TRASLADO, AJUSTE]
 *                         description: Tipo de movimiento
 *                         example: ENTRADA
 *                       cantidad:
 *                         type: integer
 *                         description: Cantidad de productos
 *                         example: 10
 *                       precioUnitario:
 *                         type: number
 *                         format: float
 *                         description: Precio unitario (opcional)
 *                         example: 15.99
 *                       documentoRelacionadoTipo:
 *                         type: string
 *                         description: Tipo de documento relacionado (opcional)
 *                         example: COMPRA
 *                       documentoRelacionadoId:
 *                         type: integer
 *                         description: ID del documento relacionado (opcional)
 *                         example: 123
 *                       usuarioId:
 *                         type: integer
 *                         description: ID del usuario que realizó el movimiento
 *                         example: 95
 *                       observacion:
 *                         type: string
 *                         description: Observaciones (opcional)
 *                         example: Ajuste manual de inventario
 *                       autorizado:
 *                         type: boolean
 *                         description: Indica si el movimiento fue autorizado
 *                         example: true
 *                       autorizadoPorId:
 *                         type: integer
 *                         description: ID del usuario que autorizó el movimiento (opcional)
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha y hora de creación
 *                         example: 2023-01-01T00:00:00Z
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         description: Fecha y hora de última actualización
 *                         example: 2023-01-01T00:00:00Z
 *                       Producto:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID del producto
 *                             example: 5
 *                           nombre:
 *                             type: string
 *                             description: Nombre del producto
 *                             example: Producto Ejemplo
 *                           codigo:
 *                             type: string
 *                             description: Código del producto
 *                             example: PROD-001
 *                       SucursalOrigen:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID de la sucursal de origen
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la sucursal de origen
 *                             example: Sucursal Principal
 *                       SucursalDestino:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             description: ID de la sucursal de destino
 *                             example: 1
 *                           nombre:
 *                             type: string
 *                             description: Nombre de la sucursal de destino
 *                             example: Sucursal Principal
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al obtener los movimientos"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/movimientos', verificarToken, inventarioController.obtenerMovimientos);

/**
 * @swagger
 * /inventario/stock-bajo/{sucursalId}:
 *   get:
 *     summary: Obtener productos con stock bajo en una sucursal
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de productos con stock bajo
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productoId:
 *                     type: integer
 *                     description: ID del producto
 *                   nombre:
 *                     type: string
 *                     description: Nombre del producto
 *                   stock:
 *                     type: number
 *                     format: float
 *                     description: Stock actual
 *                   stockMinimo:
 *                     type: number
 *                     format: float
 *                     description: Stock mínimo permitido
 *       500:
 *         description: Error al obtener productos con stock bajo
 */
router.get('/stock-bajo/:sucursalId', verificarToken, inventarioController.obtenerProductosStockBajo);

// Nuevas rutas para MovimientoInventario
/**
 * @swagger
 * /inventario/busqueda:
 *   get:
 *     summary: Obtener inventario con búsqueda y paginación
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para código o nombre del producto
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
 *         description: Inventario con paginación
 *       500:
 *         description: Error al obtener inventario
 */
router.get('/busqueda', verificarToken, inventarioController.obtenerInventarioConBusqueda);

/**
 * @swagger
 * /inventario/productos-activos:
 *   get:
 *     summary: Obtener productos activos para selects
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de productos activos
 *       500:
 *         description: Error al obtener productos
 */
router.get('/productos-activos', verificarToken, inventarioController.obtenerProductosActivos);

/**
 * @swagger
 * /inventario/sucursales-activas:
 *   get:
 *     summary: Obtener sucursales activas para selects
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sucursales activas
 *       500:
 *         description: Error al obtener sucursales
 */
router.get('/sucursales-activas', verificarToken, inventarioController.obtenerSucursalesActivas);

/**
 * @swagger
 * /inventario/trasladar:
 *   post:
 *     summary: Trasladar producto entre sucursales
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - sucursalOrigenId
 *               - sucursalDestinoId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *               sucursalOrigenId:
 *                 type: integer
 *               sucursalDestinoId:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               motivo:
 *                 type: string
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Traslado realizado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/trasladar', verificarToken, esAdminOSuperAdminOAlmacenero, inventarioController.trasladarProducto);

/**
 * @swagger
 * /inventario/remover:
 *   post:
 *     summary: Remover producto del inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - sucursalId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *               sucursalId:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               motivo:
 *                 type: string
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Producto removido exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/remover', verificarToken, esAdminOSuperAdminOAlmacenero, inventarioController.removerProducto);

/**
 * @swagger
 * /inventario/ajustar:
 *   post:
 *     summary: Ajustar stock de producto
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - sucursalId
 *               - stockReal
 *             properties:
 *               productoId:
 *                 type: integer
 *               sucursalId:
 *                 type: integer
 *               stockReal:
 *                 type: number
 *               observacion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Stock ajustado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/ajustar', verificarToken, esAdminOSuperAdminOAlmacenero, inventarioController.ajustarStock);

/**
 * @swagger
 * /inventario/ingresar:
 *   post:
 *     summary: Ingresar producto al inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - productoId
 *               - sucursalId
 *               - cantidad
 *             properties:
 *               productoId:
 *                 type: integer
 *               sucursalId:
 *                 type: integer
 *               cantidad:
 *                 type: number
 *               motivo:
 *                 type: string
 *               observacion:
 *                 type: string
 *               fechaRegistro:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Producto ingresado exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       403:
 *         description: Sin permisos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/ingresar', verificarToken, esAdminOSuperAdminOAlmacenero, inventarioController.ingresarProducto);







/**
 * @swagger
 * /inventario/traslado/{id}/pdf:
 *   get:
 *     summary: Generar PDF de un traslado específico
 *     description: Genera y descarga un PDF con los detalles de un traslado de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del movimiento de traslado
 *     responses:
 *       200:
 *         description: PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Traslado no encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Traslado no encontrado"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al generar el PDF"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/traslado/:id/pdf', verificarToken, inventarioController.generarPdfTraslado);

/**
 * @swagger
 * /inventario/exportar-revision-excel:
 *   get:
 *     summary: Exportar revisión de inventario a Excel
 *     description: Genera y descarga un archivo Excel con los datos de revisión de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: ID de la categoría para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para productos
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error interno del servidor
 */
router.get('/exportar-revision-excel', verificarToken, inventarioController.exportarRevisionInventarioExcel);

/**
 * @swagger
 * /inventario/exportar-revision-pdf:
 *   get:
 *     summary: Exportar revisión de inventario a PDF
 *     description: Genera y descarga un archivo PDF con los datos de revisión de inventario
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: ID de la categoría para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para productos
 *     responses:
 *       200:
 *         description: Archivo PDF generado exitosamente
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       500:
 *         description: Error interno del servidor
 */
router.get('/exportar-revision-pdf', verificarToken, inventarioController.exportarRevisionInventarioPdf);






/**
 * @swagger
 * /inventario/exportar-stock-historico-excel:
 *   get:
 *     summary: Exportar stock histórico a Excel
 *     description: Genera y descarga un archivo Excel con los datos de stock histórico en un rango de fechas
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio del rango (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin del rango (YYYY-MM-DD)
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para productos
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/exportar-stock-historico-excel', verificarToken, inventarioController.exportarStockHistoricoExcel);

/**
 * @swagger
 * /inventario/stock-historico:
 *   get:
 *     summary: Obtener stock histórico con filtros de fecha
 *     description: Obtiene el historial de movimientos de inventario agrupado por producto en un rango de fechas específico
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de inicio del rango (YYYY-MM-DD)
 *         example: "2023-01-01"
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         required: true
 *         description: Fecha de fin del rango (YYYY-MM-DD)
 *         example: "2023-12-31"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal para filtrar
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Término de búsqueda para código o nombre del producto
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Número de página para paginación
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Cantidad de elementos por página
 *     responses:
 *       200:
 *         description: Stock histórico obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stockHistorico:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: ID del producto
 *                       producto:
 *                         type: string
 *                         description: Nombre del producto
 *                       codigo:
 *                         type: string
 *                         description: Código del producto
 *                       fisico:
 *                         type: object
 *                         properties:
 *                           ingreso:
 *                             type: number
 *                             description: Cantidad de ingresos en el período
 *                           salida:
 *                             type: number
 *                             description: Cantidad de salidas en el período
 *                           saldo:
 *                             type: number
 *                             description: Saldo del período (ingreso - salida)
 *                           saldoAnterior:
 *                             type: number
 *                             description: Saldo anterior al período
 *                           saldoTotal:
 *                             type: number
 *                             description: Saldo total (anterior + período)
 *                       valorizado:
 *                         type: object
 *                         properties:
 *                           ingreso:
 *                             type: number
 *                             description: Valor de ingresos en el período
 *                           salida:
 *                             type: number
 *                             description: Valor de salidas en el período
 *                           saldo:
 *                             type: number
 *                             description: Saldo valorizado del período
 *                           saldoAnterior:
 *                             type: number
 *                             description: Saldo valorizado anterior al período
 *                           saldoTotal:
 *                             type: number
 *                             description: Saldo valorizado total
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       description: Página actual
 *                     totalPages:
 *                       type: integer
 *                       description: Total de páginas
 *                     totalItems:
 *                       type: integer
 *                       description: Total de elementos
 *                     itemsPerPage:
 *                       type: integer
 *                       description: Elementos por página
 *       400:
 *         description: Fechas requeridas no proporcionadas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Las fechas desde y hasta son requeridas"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Error al obtener stock histórico"
 *                 error:
 *                   type: string
 *                   example: "Mensaje de error específico"
 */
router.get('/stock-historico', verificarToken, inventarioController.obtenerStockHistorico);

/**
 * @swagger
 * /inventario/exportar-kardex-excel:
 *   get:
 *     summary: Exportar kardex a Excel
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Archivo Excel del kardex
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error al exportar kardex
 */
router.get('/exportar-kardex-excel', verificarToken, inventarioController.exportarKardexExcel);

/**
 * @swagger
 * /inventario/exportar-kardex-pdf:
 *   get:
 *     summary: Exportar kardex a PDF
 *     tags: [Inventario]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Archivo PDF del kardex
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Error en los parámetros
 *       500:
 *         description: Error al exportar kardex
 */
router.get('/exportar-kardex-pdf', verificarToken, inventarioController.exportarKardexPdf);

module.exports = router;