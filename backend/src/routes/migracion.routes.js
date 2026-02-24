const express = require('express');
const router = express.Router();
const {
  migrarProductos,
  obtenerAlmacenesParaMigracion,
  obtenerProductosConInventario,
  obtenerHistorialMigraciones
} = require('../controllers/migracion.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     MigracionProducto:
 *       type: object
 *       required:
 *         - productoId
 *         - almacenOrigenId
 *         - almacenDestinoId
 *         - cantidad
 *       properties:
 *         productoId:
 *           type: integer
 *           description: ID del producto a migrar
 *           example: 1
 *         almacenOrigenId:
 *           type: integer
 *           description: ID del almacén de origen
 *           example: 1
 *         almacenDestinoId:
 *           type: integer
 *           description: ID del almacén de destino
 *           example: 2
 *         cantidad:
 *           type: integer
 *           description: Cantidad a migrar
 *           example: 10
 *         motivo:
 *           type: string
 *           description: Motivo de la migración
 *           example: 'Reubicación de inventario'
 *     HistorialMigracion:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la migración
 *           example: 1
 *         productoId:
 *           type: integer
 *           description: ID del producto migrado
 *           example: 1
 *         almacenOrigenId:
 *           type: integer
 *           description: ID del almacén de origen
 *           example: 1
 *         almacenDestinoId:
 *           type: integer
 *           description: ID del almacén de destino
 *           example: 2
 *         cantidad:
 *           type: integer
 *           description: Cantidad migrada
 *           example: 10
 *         motivo:
 *           type: string
 *           description: Motivo de la migración
 *           example: 'Reubicación de inventario'
 *         usuarioId:
 *           type: integer
 *           description: ID del usuario que realizó la migración
 *           example: 1
 *         fechaMigracion:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de la migración
 *           example: '2023-01-01T00:00:00Z'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de creación del registro
 *           example: '2023-01-01T00:00:00Z'
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha y hora de última actualización del registro
 *           example: '2023-01-01T00:00:00Z'
 */

/**
 * @swagger
 * /api/migracion/productos:
 *   post:
 *     summary: Migrar productos entre almacenes
 *     tags: [Migración]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MigracionProducto'
 *     responses:
 *       200:
 *         description: Migración realizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Migración realizada exitosamente'
 *                 migracion:
 *                   $ref: '#/components/schemas/HistorialMigracion'
 *       400:
 *         description: Datos de entrada inválidos o stock insuficiente
 *       404:
 *         description: Producto o almacén no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/productos', migrarProductos);

/**
 * @swagger
 * /api/migracion/almacenes:
 *   get:
 *     summary: Obtener almacenes disponibles para migración
 *     tags: [Migración]
 *     responses:
 *       200:
 *         description: Lista de almacenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: 'Almacén Principal'
 *                   descripcion:
 *                     type: string
 *                     example: 'Almacén principal para productos de ferretería'
 *                   ubicacion:
 *                     type: string
 *                     example: 'Planta baja, sector A'
 *                   tipo:
 *                     type: string
 *                     example: 'PRINCIPAL'
 *                   estado:
 *                     type: boolean
 *                     example: true
 *       500:
 *         description: Error interno del servidor
 */
router.get('/almacenes', obtenerAlmacenesParaMigracion);

/**
 * @swagger
 * /api/migracion/productos-inventario:
 *   get:
 *     summary: Obtener productos con inventario disponible
 *     tags: [Migración]
 *     parameters:
 *       - in: query
 *         name: almacenId
 *         schema:
 *           type: integer
 *         description: ID del almacén para filtrar productos
 *         example: 1
 *     responses:
 *       200:
 *         description: Lista de productos con inventario obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: 'Martillo'
 *                   codigo:
 *                     type: string
 *                     example: 'MAR001'
 *                   descripcion:
 *                     type: string
 *                     example: 'Martillo de acero'
 *                   inventario:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         almacenId:
 *                           type: integer
 *                           example: 1
 *                         almacenNombre:
 *                           type: string
 *                           example: 'Almacén Principal'
 *                         cantidad:
 *                           type: integer
 *                           example: 50
 *       500:
 *         description: Error interno del servidor
 */
router.get('/productos-inventario', obtenerProductosConInventario);

/**
 * @swagger
 * /api/migracion/historial:
 *   get:
 *     summary: Obtener historial de migraciones
 *     tags: [Migración]
 *     parameters:
 *       - in: query
 *         name: productoId
 *         schema:
 *           type: integer
 *         description: ID del producto para filtrar migraciones
 *         example: 1
 *       - in: query
 *         name: almacenOrigenId
 *         schema:
 *           type: integer
 *         description: ID del almacén de origen para filtrar migraciones
 *         example: 1
 *       - in: query
 *         name: almacenDestinoId
 *         schema:
 *           type: integer
 *         description: ID del almacén de destino para filtrar migraciones
 *         example: 2
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio para filtrar migraciones
 *         example: '2023-01-01'
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin para filtrar migraciones
 *         example: '2023-12-31'
 *     responses:
 *       200:
 *         description: Historial de migraciones obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/HistorialMigracion'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/historial', obtenerHistorialMigraciones);

module.exports = router;