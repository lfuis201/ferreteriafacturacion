const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoria.controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin } = require('../middlewares/roleMiddleware');







/**
 * @swagger
 * tags:
 *   name: Categorías
 *   description: API para gestión de categorías de productos(4)
 */

/**
 * @swagger
 * /categorias:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna una lista de todas las categorías activas
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Categoria'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, categoriaController.obtenerCategorias);



/**
 * @swagger
 * /categorias/{id}:
 *   get:
 *     summary: Obtener una categoría por ID
 *     description: Retorna los detalles de una categoría específica
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Detalles de la categoría
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */
router.get('/:id', verificarToken, categoriaController.obtenerCategoriaPorId);


/**
 * @swagger
 * /categorias:
 *   post:
 *     summary: Crear una nueva categoría
 *     description: Crea una nueva categoría con los datos proporcionados
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nombre
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoría (debe ser único)
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la categoría
 *               estado:
 *                 type: boolean
 *                 description: Estado de la categoría (activo/inactivo)
 *     responses:
 *       201:
 *         description: Categoría creada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Datos inválidos - El nombre ya existe o falta el nombre
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: Prohibido - No tiene permisos para crear categorías
 *       500:
 *         description: Error del servidor
 */

router.post('/', [verificarToken, esAdminOSuperAdmin], categoriaController.crearCategoria);



/**
 * @swagger
 * /categorias/{id}:
 *   put:
 *     summary: Actualizar una categoría
 *     description: Actualiza los datos de una categoría existente
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 description: Nombre de la categoría (debe ser único)
 *               descripcion:
 *                 type: string
 *                 description: Descripción de la categoría
 *               estado:
 *                 type: boolean
 *                 description: Estado de la categoría (activo/inactivo)
 *     responses:
 *       200:
 *         description: Categoría actualizada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Categoria'
 *       400:
 *         description: Datos inválidos - El nombre ya existe o falta el nombre
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: Prohibido - No tiene permisos para actualizar categorías
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */

router.put('/:id', [verificarToken, esAdminOSuperAdmin], categoriaController.actualizarCategoria);





/**
 * @swagger
 * /categorias/{id}:
 *   delete:
 *     summary: Eliminar una categoría permanentemente de la base de datos
 *     description: Elimina una categoría existente de la base de datos
 *     tags: [Categorías]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la categoría
 *     responses:
 *       200:
 *         description: Categoría eliminada permanentemente de la base de datos
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       401:
 *         description: No autorizado - Token no proporcionado o inválido
 *       403:
 *         description: Prohibido - No tiene permisos para eliminar categorías
 *       404:
 *         description: Categoría no encontrada
 *       500:
 *         description: Error del servidor
 */

router.delete('/:id', [verificarToken, esAdminOSuperAdmin], categoriaController.eliminarCategoria);

module.exports = router;