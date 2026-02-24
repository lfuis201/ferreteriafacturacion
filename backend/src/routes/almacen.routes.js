const express = require('express');
const router = express.Router();
const {
  obtenerAlmacenes,
  obtenerAlmacenPorId,
  crearAlmacen,
  actualizarAlmacen,
  eliminarAlmacen,
  obtenerInventarioAlmacen,
  actualizarPreciosAlmacen
} = require('../controllers/almacen.controller');

/**
 * @swagger
 * components:
 *   schemas:
 *     Almacen:
 *       type: object
 *       required:
 *         - nombre
 *         - sucursalId
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único del almacén
 *           example: 1
 *         nombre:
 *           type: string
 *           description: Nombre del almacén
 *           example: 'Almacén Principal'
 *         descripcion:
 *           type: string
 *           description: Descripción del almacén (opcional)
 *           example: 'Almacén principal para productos de ferretería'
 *         ubicacion:
 *           type: string
 *           description: Ubicación física del almacén (opcional)
 *           example: 'Planta baja, sector A'
 *         sucursalId:
 *           type: integer
 *           description: ID de la sucursal a la que pertenece
 *           example: 1
 *         tipo:
 *           type: string
 *           enum: ['PRINCIPAL', 'TALLER', 'MOSTRADOR', 'DEPOSITO', 'OTRO']
 *           description: Tipo de almacén
 *           example: 'PRINCIPAL'
 *         estado:
 *           type: boolean
 *           description: Estado del almacén (activo/inactivo)
 *           example: true
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
 *       example:
 *         id: 1
 *         nombre: 'Almacén Principal'
 *         descripcion: 'Almacén principal para productos de ferretería'
 *         ubicacion: 'Planta baja, sector A'
 *         sucursalId: 1
 *         tipo: 'PRINCIPAL'
 *         estado: true
 */

/**
 * @swagger
 * /api/almacenes:
 *   get:
 *     summary: Obtener todos los almacenes
 *     tags: [Almacenes]
 *     responses:
 *       200:
 *         description: Lista de almacenes obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Almacen'
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', obtenerAlmacenes);

/**
 * @swagger
 * /api/almacenes/{id}:
 *   get:
 *     summary: Obtener un almacén por ID
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Almacén encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id', obtenerAlmacenPorId);

/**
 * @swagger
 * /api/almacenes:
 *   post:
 *     summary: Crear un nuevo almacén
 *     tags: [Almacenes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *               - sucursalId
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: 'Almacén Principal'
 *               descripcion:
 *                 type: string
 *                 example: 'Almacén principal para productos de ferretería'
 *               ubicacion:
 *                 type: string
 *                 example: 'Planta baja, sector A'
 *               sucursalId:
 *                 type: integer
 *                 example: 1
 *               tipo:
 *                 type: string
 *                 enum: ['PRINCIPAL', 'TALLER', 'MOSTRADOR', 'DEPOSITO', 'OTRO']
 *                 example: 'PRINCIPAL'
 *               estado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Almacén creado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', crearAlmacen);

/**
 * @swagger
 * /api/almacenes/{id}:
 *   put:
 *     summary: Actualizar un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del almacén
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: 'Almacén Principal'
 *               descripcion:
 *                 type: string
 *                 example: 'Almacén principal para productos de ferretería'
 *               ubicacion:
 *                 type: string
 *                 example: 'Planta baja, sector A'
 *               sucursalId:
 *                 type: integer
 *                 example: 1
 *               tipo:
 *                 type: string
 *                 enum: ['PRINCIPAL', 'TALLER', 'MOSTRADOR', 'DEPOSITO', 'OTRO']
 *                 example: 'PRINCIPAL'
 *               estado:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Almacén actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Almacen'
 *       404:
 *         description: Almacén no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id', actualizarAlmacen);

/**
 * @swagger
 * /api/almacenes/{id}:
 *   delete:
 *     summary: Eliminar un almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Almacén eliminado exitosamente
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:id', eliminarAlmacen);

/**
 * @swagger
 * /api/almacenes/{id}/inventario:
 *   get:
 *     summary: Obtener inventario de un almacén específico
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del almacén
 *     responses:
 *       200:
 *         description: Inventario del almacén obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   productoId:
 *                     type: integer
 *                     example: 1
 *                   nombre:
 *                     type: string
 *                     example: 'Martillo'
 *                   cantidad:
 *                     type: integer
 *                     example: 50
 *                   precio:
 *                     type: number
 *                     format: decimal
 *                     example: 25.99
 *       404:
 *         description: Almacén no encontrado
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:id/inventario', obtenerInventarioAlmacen);

/**
 * @swagger
 * /api/almacenes/{id}/actualizar-precios:
 *   put:
 *     summary: Actualizar precios por almacén
 *     tags: [Almacenes]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID del almacén
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               productos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productoId:
 *                       type: integer
 *                       example: 1
 *                     precio:
 *                       type: number
 *                       format: decimal
 *                       example: 25.99
 *     responses:
 *       200:
 *         description: Precios actualizados exitosamente
 *       404:
 *         description: Almacén no encontrado
 *       400:
 *         description: Datos de entrada inválidos
 *       500:
 *         description: Error interno del servidor
 */
router.put('/:id/actualizar-precios', actualizarPreciosAlmacen);

module.exports = router;