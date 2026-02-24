const express = require('express');
const router = express.Router();
const configuracionController = require('../controllers/configuracion.controller');
const verificarToken = require('../middlewares/verificarToken');

/**
 * @swagger
 * components:
 *   schemas:
 *     Configuracion:
 *       type: object
 *       required:
 *         - clave
 *         - valor
 *         - tipo
 *       properties:
 *         id:
 *           type: integer
 *           description: ID único de la configuración
 *         clave:
 *           type: string
 *           maxLength: 100
 *           description: Clave única de la configuración
 *           example: "IGV_VISIBLE"
 *         valor:
 *           type: string
 *           description: Valor de la configuración
 *           example: "true"
 *         tipo:
 *           type: string
 *           enum: [STRING, NUMBER, BOOLEAN, JSON]
 *           description: Tipo de dato del valor
 *           example: "BOOLEAN"
 *         descripcion:
 *           type: string
 *           maxLength: 500
 *           description: Descripción de la configuración
 *           example: "Controla si el IGV se muestra en las facturas"
 *         categoria:
 *           type: string
 *           maxLength: 100
 *           description: Categoría de la configuración
 *           example: "FACTURACION"
 *         activo:
 *           type: boolean
 *           description: Indica si la configuración está activa
 *           example: true
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de creación
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Fecha de última actualización
 */

/**
 * @swagger
 * /configuraciones:
 *   get:
 *     summary: Obtener todas las configuraciones
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *         description: Filtrar por categoría
 *       - in: query
 *         name: activo
 *         schema:
 *           type: boolean
 *         description: Filtrar por estado activo
 *     responses:
 *       200:
 *         description: Lista de configuraciones obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 configuraciones:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Configuracion'
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/', verificarToken, configuracionController.obtenerConfiguraciones);

/**
 * @swagger
 * /configuraciones/{clave}:
 *   get:
 *     summary: Obtener una configuración específica
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la configuración
 *     responses:
 *       200:
 *         description: Configuración obtenida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 configuracion:
 *                   $ref: '#/components/schemas/Configuracion'
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:clave', verificarToken, configuracionController.obtenerConfiguracion);

/**
 * @swagger
 * /configuraciones/{clave}/valor:
 *   get:
 *     summary: Obtener solo el valor de una configuración
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la configuración
 *       - in: query
 *         name: valorPorDefecto
 *         schema:
 *           type: string
 *         description: Valor por defecto si no se encuentra la configuración
 *     responses:
 *       200:
 *         description: Valor obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 clave:
 *                   type: string
 *                 valor:
 *                   oneOf:
 *                     - type: string
 *                     - type: number
 *                     - type: boolean
 *                     - type: object
 *       401:
 *         description: Token no válido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/:clave/valor', verificarToken, configuracionController.obtenerValorConfiguracion);

/**
 * @swagger
 * /configuraciones:
 *   post:
 *     summary: Crear o actualizar una configuración
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - clave
 *               - valor
 *             properties:
 *               clave:
 *                 type: string
 *                 maxLength: 100
 *                 description: Clave única de la configuración
 *                 example: "IGV_VISIBLE"
 *               valor:
 *                 oneOf:
 *                   - type: string
 *                   - type: number
 *                   - type: boolean
 *                   - type: object
 *                 description: Valor de la configuración
 *                 example: true
 *               tipo:
 *                 type: string
 *                 enum: [STRING, NUMBER, BOOLEAN, JSON]
 *                 description: Tipo de dato del valor
 *                 example: "BOOLEAN"
 *               descripcion:
 *                 type: string
 *                 maxLength: 500
 *                 description: Descripción de la configuración
 *                 example: "Controla si el IGV se muestra en las facturas"
 *               categoria:
 *                 type: string
 *                 maxLength: 100
 *                 description: Categoría de la configuración
 *                 example: "FACTURACION"
 *           examples:
 *             igv_visible:
 *               summary: Configuración para mostrar/ocultar IGV
 *               value:
 *                 clave: "IGV_VISIBLE"
 *                 valor: true
 *                 tipo: "BOOLEAN"
 *                 descripcion: "Controla si el IGV se muestra en las facturas y documentos"
 *                 categoria: "FACTURACION"
 *             porcentaje_igv:
 *               summary: Configuración del porcentaje de IGV
 *               value:
 *                 clave: "PORCENTAJE_IGV"
 *                 valor: 18
 *                 tipo: "NUMBER"
 *                 descripcion: "Porcentaje del IGV aplicado a las ventas"
 *                 categoria: "FACTURACION"
 *     responses:
 *       200:
 *         description: Configuración establecida exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 configuracion:
 *                   $ref: '#/components/schemas/Configuracion'
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos para modificar configuraciones
 *       500:
 *         description: Error interno del servidor
 */
router.post('/', verificarToken, configuracionController.establecerConfiguracion);

/**
 * @swagger
 * /configuraciones/{clave}/toggle:
 *   patch:
 *     summary: Activar/desactivar una configuración
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la configuración
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               activo:
 *                 type: boolean
 *                 description: Estado activo (opcional, si no se envía se alterna)
 *     responses:
 *       200:
 *         description: Estado actualizado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 configuracion:
 *                   $ref: '#/components/schemas/Configuracion'
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Sin permisos para modificar configuraciones
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:clave/toggle', verificarToken, configuracionController.toggleConfiguracion);

/**
 * @swagger
 * /configuraciones/{clave}:
 *   delete:
 *     summary: Eliminar una configuración
 *     tags: [Configuraciones]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: clave
 *         required: true
 *         schema:
 *           type: string
 *         description: Clave de la configuración
 *     responses:
 *       200:
 *         description: Configuración eliminada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *       404:
 *         description: Configuración no encontrada
 *       401:
 *         description: Token no válido
 *       403:
 *         description: Solo SuperAdmin puede eliminar configuraciones
 *       500:
 *         description: Error interno del servidor
 */
router.delete('/:clave', verificarToken, configuracionController.eliminarConfiguracion);

module.exports = router;