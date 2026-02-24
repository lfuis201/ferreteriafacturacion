const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');
const upload = require('../config/uploadConfig');
const uploadExcel = require('../config/uploadExcelConfig');


/**
 * @swagger
 * tags:
 *   name: Productos
 *   description: API para gestión de productos(5)
 */

/**
 * @swagger
 * /productos:
 *   get:
 *     summary: Obtener todos los productos
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre
 *     responses:
 *       200:
 *         description: Lista de productos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Producto'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, productoController.obtenerProductos);

/**
 * @swagger
 * /productos/con-inventario:
 *   get:
 *     summary: Obtener productos con información de inventario
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: nombre
 *         schema:
 *           type: string
 *         description: Buscar por nombre
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal para obtener stock específico
 *     responses:
 *       200:
 *         description: Lista de productos con información de inventario
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 productos:
 *                   type: array
 *                   items:
 *                     allOf:
 *                       - $ref: '#/components/schemas/Producto'
 *                       - type: object
 *                         properties:
 *                           stock:
 *                             type: number
 *                             description: Stock actual del producto
 *                           stockMinimo:
 *                             type: number
 *                             description: Stock mínimo del producto
 *                           precioVentaInventario:
 *                             type: number
 *                             description: Precio de venta desde inventario
 *       500:
 *         description: Error del servidor
 */
router.get('/con-inventario', verificarToken, productoController.obtenerProductosConInventario);

/**
 * @swagger
 * /productos/exportar-excel:
 *   get:
 *     summary: Exportar productos a Excel
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoriaId
 *         schema:
 *           type: integer
 *         description: Filtrar por categoría
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: Filtrar por sucursal
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde (YYYY-MM-DD)
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Archivo Excel generado
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       403:
 *         description: No tiene permisos para exportar productos
 *       500:
 *         description: Error del servidor
 */
router.get('/exportar-excel', [verificarToken, esAdminOSuperAdminOAlmacenero], productoController.exportarExcel);

/**
 * @swagger
 * /productos/{id}:
 *   get:
 *     summary: Obtener un producto por ID
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Producto'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, productoController.obtenerProductoPorId);

/**
 * @swagger
 * /productos:
 *   post:
 *     summary: Crear un nuevo producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - codigo
 *               - precioCompra
 *               - precioVenta
 *               - unidadMedida
 *               - categoriaId
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precioCompra:
 *                 type: number
 *                 format: float
 *               precioVenta:
 *                 type: number
 *                 format: float
 *               productosRelacionados:
 *                 type: string
 *               codigoTipoMoneda:
 *                 type: string
 *               codigoTipoAfectacionIgvVenta:
 *                 type: string
 *               tieneIgv:
 *                 type: boolean
 *               codigoTipoAfectacionIgvCompra:
 *                 type: string
 *               stock:
 *                 type: integer
 *               stockMinimo:
 *                 type: integer
 *               unidadMedida:
 *                 type: string
 *               codigoBarras:
 *                 type: string
 *               tipodeAfectacion:
 *                 type: string
 *                 enum: ['Gravado_Operación_Onerosa', 'Gravado_Retiro_por_premio', 'Gravado_Retiro_por_donación', 'Gravado_Retiro', 'Gravado_Retiro_por_publicidad', 'Gravado_Bonificaciones', 'Gravado_Retiro_por_entrega_a_trabajadores', 'Exonerado_Operación_Onerosa', 'Exonerado_Retiro', 'Inafecto_Operación_Onerosa', 'Inafecto_Retiro_por_Bonificación', 'Inafecto_Retiro', 'Exonerado_Transferencia_Gratuita']
 *               modelo:
 *                 type: string
 *               marca:
 *                 type: string
 *               origen:
 *                 type: string
 *               codigosunat:
 *                 type: string
 *               codigoprovedorOEM:
 *                 type: string
 *               codigoCompetencia:
 *                 type: string
 *               rangoAnos:
 *                 type: string
 *                 format: date
 *               observaciones:
 *                 type: string
 *               categoriaId:
 *                 type: integer
 *               imagen1:
 *                 type: string
 *                 format: binary
 *               imagen2:
 *                 type: string
 *                 format: binary
 *               imagen3:
 *                 type: string
 *                 format: binary
 *               iscActivo:
 *                 type: boolean
 *               tipoAplicacionISC:
 *                 type: string
 *                 enum: ['Aplicación del Monto Fijo', 'Sistema al valor', 'Sistema de Precios de Venta al Público']
 *               sujetoDetraccion:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Producto creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos para crear productos
 *       500:
 *         description: Error del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOAlmacenero, upload], productoController.crearProducto);

/**
 * @swagger
 * /productos/{id}:
 *   put:
 *     summary: Actualizar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               codigo:
 *                 type: string
 *               descripcion:
 *                 type: string
 *               precioCompra:
 *                 type: number
 *                 format: float
 *               precioVenta:
 *                 type: number
 *                 format: float
 *               unidadMedida:
 *                 type: string
 *               codigoBarras:
 *                 type: string
 *               tipodeAfectacion:
 *                 type: string
 *                 enum: ['Gravado_Operación_Onerosa', 'Gravado_Retiro_por_premio', 'Gravado_Retiro_por_donación', 'Gravado_Retiro', 'Gravado_Retiro_por_publicidad', 'Gravado_Bonificaciones', 'Gravado_Retiro_por_entrega_a_trabajadores', 'Exonerado_Operación_Onerosa', 'Exonerado_Retiro', 'Inafecto_Operación_Onerosa', 'Inafecto_Retiro_por_Bonificación', 'Inafecto_Retiro', 'Exonerado_Transferencia_Gratuita']
 *               modelo:
 *                 type: string
 *               marca:
 *                 type: string
 *               origen:
 *                 type: string
 *               codigosunat:
 *                 type: string
 *               codigoprovedorOEM:
 *                 type: string
 *               codigoCompetencia:
 *                 type: string
 *               rangoAnos:
 *                 type: string
 *                 format: date
 *               observaciones:
 *                 type: string
 *               categoriaId:
 *                 type: integer
 *               imagen1:
 *                 type: string
 *                 format: binary
 *               imagen2:
 *                 type: string
 *                 format: binary
 *               imagen3:
 *                 type: string
 *                 format: binary
 *               iscActivo:
 *                 type: boolean
 *               tipoAplicacionISC:
 *                 type: string
 *                 enum: ['Aplicación del Monto Fijo', 'Sistema al valor', 'Sistema de Precios de Venta al Público']
 *               sujetoDetraccion:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Producto actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 producto:
 *                   $ref: '#/components/schemas/Producto'
 *       403:
 *         description: No tiene permisos para actualizar productos
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero, upload], productoController.actualizarProducto);

/**
 * @swagger
 * /productos/{id}:
 *   delete:
 *     summary: Eliminar un producto
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del producto
 *     responses:
 *       200:
 *         description: Producto eliminado exitosamente
 *       403:
 *         description: No tiene permisos para eliminar productos
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], productoController.eliminarProducto);



/**
 * @swagger
 * /productos/importar-excel:
 *   post:
 *     summary: Importar productos desde archivo Excel
 *     tags: [Productos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - archivo
 *             properties:
 *               archivo:
 *                 type: string
 *                 format: binary
 *                 description: Archivo Excel con productos y presentaciones
 *     responses:
 *       200:
 *         description: Productos importados exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 productosCreados:
 *                   type: integer
 *                 presentacionesCreadas:
 *                   type: integer
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Error en el archivo o datos inválidos
 *       403:
 *         description: No tiene permisos para importar productos
 *       500:
 *         description: Error del servidor
 */
router.post('/importar-excel', [verificarToken, esAdminOSuperAdminOAlmacenero, uploadExcel], productoController.importarExcel);

module.exports = router;