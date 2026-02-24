// routes/cajaRoutes.js
const express = require('express');
const router = express.Router();
const cajaController = require('../controllers/caja.Controller');
const verificarToken = require('../middlewares/verificarToken');
const { esAdminOSuperAdmin, esAdminOSuperAdminOCajero } = require('../middlewares/roleMiddleware'); 


/**
 * @swagger
 * tags:
 *   name: Cajas
 *   description: API para gestionar las operaciones de caja (2.1)
 */

/**
 * @swagger
 * /cajas:
 *   post:
 *     summary: Abrir una nueva caja
 *     description: Abre una nueva caja para una sucursal específica
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sucursalId:
 *                 type: integer
 *                 description: ID de la sucursal
 *                 example: 1
 *               saldoInicial:
 *                 type: number
 *                 format: float
 *                 description: Saldo inicial de la caja
 *                 example: 1000.00
 *               observaciones:
 *                 type: string
 *                 description: Observaciones sobre la apertura de la caja
 *                 example: "Apertura de caja inicial"
 *             required:
 *               - sucursalId
 *               - saldoInicial
 *     responses:
 *       201:
 *         description: Caja abierta exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Caja abierta exitosamente"
 *                 caja:
 *                   $ref: '#/components/schemas/Caja'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', [verificarToken, esAdminOSuperAdmin, esAdminOSuperAdminOCajero], cajaController.abrirCaja);

/**
 * @swagger
 * /cajas/cerrar:
 *   post:
 *     summary: Cerrar una caja
 *     description: Cierra la caja abierta para una sucursal específica
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sucursalId:
 *                 type: integer
 *                 description: ID de la sucursal
 *                 example: 1
 *               saldoFinal:
 *                 type: number
 *                 format: float
 *                 description: Saldo final de la caja
 *                 example: 1500.00
 *               observaciones:
 *                 type: string
 *                 description: Observaciones sobre el cierre de la caja
 *                 example: "Cierre de caja del día"
 *             required:
 *               - sucursalId
 *               - saldoFinal
 *     responses:
 *       200:
 *         description: Caja cerrada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Caja cerrada exitosamente"
 *                 caja:
 *                   $ref: '#/components/schemas/Caja'
 *       400:
 *         description: Error en la solicitud
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/cerrar', [verificarToken, esAdminOSuperAdmin,esAdminOSuperAdminOCajero], cajaController.cerrarCaja);

/**
 * @swagger
 * /cajas/{id}:
 *   patch:
 *     summary: Actualizar caja (observaciones)
 *     description: Actualiza campos permitidos de una caja. Actualmente solo observaciones.
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la caja a actualizar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               observaciones:
 *                 type: string
 *                 description: Observaciones de la caja
 *     responses:
 *       200:
 *         description: Caja actualizada exitosamente
 *       403:
 *         description: No autorizado
 *       404:
 *         description: Caja no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.patch('/:id', [verificarToken, esAdminOSuperAdmin, esAdminOSuperAdminOCajero], cajaController.actualizarCaja);

/**
 * @swagger
 * /cajas/estado:
 *   get:
 *     summary: Obtener estado de caja
 *     description: Obtiene el estado actual de la caja para una sucursal específica
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *         example: 1
 *     responses:
 *       200:
 *         description: Estado de caja obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Estado de caja obtenido exitosamente"
 *                 estado:
 *                   type: string
 *                   enum: ['ABIERTA', 'CERRADA']
 *                   example: "ABIERTA"
 *                 caja:
 *                   $ref: '#/components/schemas/Caja'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No se encontró una caja abierta
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No hay una caja abierta para esta sucursal"
 *                 estado:
 *                   type: string
 *                   example: "CERRADA"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/estado', [verificarToken, esAdminOSuperAdmin,esAdminOSuperAdminOCajero], cajaController.obtenerEstadoCaja);

/**
 * @swagger
 * /cajas/reporte:
 *   get:
 *     summary: Generar reporte de caja
 *     description: Genera un reporte de las cajas cerradas para una sucursal específica y una fecha específica
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal (opcional si es SuperAdmin)
 *         example: 1
 *       - in: query
 *         name: fechaInicio 
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha del reporte (formato YYYY-MM-DD)
 *         example: "2025-08-19"
 *     responses:
 *       200:
 *         description: Reporte generado exitosamente
 *       400:
 *         description: Error en parámetros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.get('/reporte', [verificarToken, esAdminOSuperAdmin, esAdminOSuperAdminOCajero], cajaController.reporteCaja);

module.exports = router; 





//Ruta para eliminar el historial de una sucursal

/**
 * @swagger
 * /cajas/historial/{sucursalId}:
 *   delete:
 *     summary: Eliminar historial de una sucursal
 *     description: Elimina todas las cajas asociadas a una sucursal específica
 *     tags: [Cajas]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID de la sucursal
 *         example: 1
 *     responses:
 *       200:
 *         description: Historial eliminado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "Se eliminaron 10 cajas del historial de la sucursal con ID 1"
 *       403:
 *         description: No autorizado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: No se encontraron cajas para la sucursal especificada
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                   example: "No se encontraron cajas para la sucursal especificada"
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

router.delete('/historial/:sucursalId', [verificarToken, esAdminOSuperAdmin], cajaController.eliminarHistorialSucursal);