const express = require('express');
const router = express.Router();
const cuentasPorCobrarController = require('../controllers/cuentasPorCobrar.controller');
const { verificarToken } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * tags:
 *   name: CuentasPorCobrar
 *   description: Gestión de cuentas por cobrar
 */

/**
 * @swagger
 * /cuentas-por-cobrar:
 *   get:
 *     summary: Obtener todas las cuentas por cobrar
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: clienteId
 *         schema:
 *           type: integer
 *         description: ID del cliente
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: [PENDIENTE, PAGADO_PARCIAL, PAGADO_TOTAL, VENCIDO]
 *         description: Estado de la cuenta
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: fechaDesde
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha desde
 *       - in: query
 *         name: fechaHasta
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha hasta
 *     responses:
 *       200:
 *         description: Lista de cuentas por cobrar
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuentasPorCobrar:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CuentasPorCobrar'
 *       500:
 *         description: Error del servidor
 */
router.get('/', verificarToken, cuentasPorCobrarController.obtenerCuentasPorCobrar);

/**
 * @swagger
 * /cuentas-por-cobrar/resumen-deudas:
 *   get:
 *     summary: Obtener resumen de deudas por cliente
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Resumen de deudas por cliente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 resumenDeudas:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       clienteId:
 *                         type: integer
 *                       totalDeuda:
 *                         type: number
 *                       cantidadDocumentos:
 *                         type: integer
 *                       fechaVencimientoMasAntigua:
 *                         type: string
 *                         format: date
 *                       Cliente:
 *                         $ref: '#/components/schemas/Cliente'
 *       500:
 *         description: Error del servidor
 */
router.get('/resumen-deudas', verificarToken, cuentasPorCobrarController.obtenerResumenDeudas);

/**
 * @swagger
 * /cuentas-por-cobrar/vencidas:
 *   get:
 *     summary: Obtener cuentas vencidas
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Lista de cuentas vencidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 cuentasVencidas:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/CuentasPorCobrar'
 *       500:
 *         description: Error del servidor
 */
router.get('/vencidas', verificarToken, cuentasPorCobrarController.obtenerCuentasVencidas);

/**
 * @swagger
 * /cuentas-por-cobrar/{id}/pago:
 *   post:
 *     summary: Registrar pago de una cuenta por cobrar
 *     tags: [CuentasPorCobrar]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta por cobrar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - montoPago
 *             properties:
 *               montoPago:
 *                 type: number
 *                 format: float
 *                 description: Monto del pago
 *                 example: 100.00
 *               observaciones:
 *                 type: string
 *                 description: Observaciones del pago
 *                 example: "Pago parcial recibido"
 *     responses:
 *       200:
 *         description: Pago registrado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 mensaje:
 *                   type: string
 *                 cuentaPorCobrar:
 *                   $ref: '#/components/schemas/CuentasPorCobrar'
 *       400:
 *         description: Datos inválidos
 *       403:
 *         description: Sin permisos
 *       404:
 *         description: Cuenta no encontrada
 *       500:
 *         description: Error del servidor
 */
router.post('/:id/pago', verificarToken, cuentasPorCobrarController.registrarPago);

module.exports = router;