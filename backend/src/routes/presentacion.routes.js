const express = require('express');
const router = express.Router();
const presentacionController = require('../controllers/presentacion.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdminOAlmacenero } = require('../middlewares/roleMiddleware');

const uploadExcel = require('../config/uploadExcelConfig');

/**
 * @swagger
 * tags:
 *   - name: Presentaciones
 *     description: >
 *       API para gestión de presentaciones de productos.\n
 *       Las **presentaciones** son una forma de agrupar productos que se venden en diferentes unidades de medida o formatos.\n
 *       **Ejemplos:**
 *       - Un producto puede venderse en unidades individuales (1 unidad), paquetes de 6 unidades o cajas de 12 unidades.
 *       - Un tubo de PVC puede venderse en longitudes de 1, 2 o 3 metros.\n
 *       **Beneficios:**
 *       - Aumenta las ventas.
 *       - Mejora la experiencia del cliente.
 *       - Reduce la complejidad de inventario y facturación.\n
 *       El campo `factor` se utiliza para convertir unidades de medida y mostrar precios/cantidades en distintas unidades. (6) 
 */

/**
 * @swagger
 * /presentaciones:
 *   post:
 *     summary: Crear una nueva presentación
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Presentacion'
 *     responses:
 *       201:
 *         description: Presentación creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 presentacion:
 *                   $ref: '#/components/schemas/Presentacion'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos para crear presentaciones
 *       500:
 *         description: Error del servidor
 */
router.post('/', [verificarToken, esAdminOSuperAdminOAlmacenero], presentacionController.crearPresentacion);

/**
 * @swagger
 * /presentaciones:
 *   get:
 *     summary: Obtener todas las presentaciones con Id de  producto
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         description: Filtrar por producto
 *     responses:
 *       200:
 *         description: Lista de presentaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Presentacion'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, presentacionController.obtenerPresentaciones);

/**
 * @swagger
 * /presentaciones/exportar-excel:
 *   get:
 *     summary: Exportar presentaciones a Excel
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         description: ID del producto para filtrar
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar
 *     responses:
 *       200:
 *         description: Archivo Excel generado exitosamente
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: No se encontraron presentaciones con los filtros especificados
 *       500:
 *         description: Error interno del servidor
 */
router.get('/exportar-excel', verificarToken, presentacionController.exportarExcel);

/**
 * @swagger
 * /presentaciones/{id}:
 *   get:
 *     summary: Obtener una presentación por ID
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la presentación
 *     responses:
 *       200:
 *         description: Presentación encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Presentacion'
 *       404:
 *         description: Presentación no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', verificarToken, presentacionController.obtenerPresentacionPorId);

/**
 * @swagger
 * /presentaciones/{id}:
 *   put:
 *     summary: Actualizar una presentación
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la presentación
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Presentacion'
 *     responses:
 *       200:
 *         description: Presentación actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 presentacion:
 *                   $ref: '#/components/schemas/Presentacion'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: No tiene permisos para actualizar presentaciones
 *       404:
 *         description: Presentación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.put('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], presentacionController.actualizarPresentacion);

/**
 * @swagger
 * /presentaciones/{id}:
 *   delete:
 *     summary: Eliminar una presentación
 *     tags: [Presentaciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la presentación
 *     responses:
 *       200:
 *         description: Presentación eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       403:
 *         description: No tiene permisos para eliminar presentaciones
 *       404:
 *         description: Presentación no encontrada
 *       500:
 *         description: Error del servidor
 */
router.delete('/:id', [verificarToken, esAdminOSuperAdminOAlmacenero], presentacionController.eliminarPresentacion);



/**
 * @swagger
 * /presentaciones/importar-excel:
 *   post:
 *     summary: Importar presentaciones desde archivo Excel
 *     tags: [Presentaciones]
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
 *                 description: Archivo Excel con presentaciones
 *     responses:
 *       200:
 *         description: Presentaciones importadas exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 presentacionesCreadas:
 *                   type: integer
 *                 presentacionesActualizadas:
 *                   type: integer
 *                 errores:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       fila:
 *                         type: integer
 *                       error:
 *                         type: string
 *                       datos:
 *                         type: object
 *                 resumen:
 *                   type: object
 *                   properties:
 *                     totalFilas:
 *                       type: integer
 *                     procesadas:
 *                       type: integer
 *                     exitosas:
 *                       type: integer
 *                     conErrores:
 *                       type: integer
 *       400:
 *         description: Error en el archivo o datos inválidos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 error:
 *                   type: string
 *       403:
 *         description: No tiene permisos para importar presentaciones
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 error:
 *                   type: string
 */
router.post('/importar-excel', [verificarToken, esAdminOSuperAdminOAlmacenero, uploadExcel], presentacionController.importarExcel);

module.exports = router;