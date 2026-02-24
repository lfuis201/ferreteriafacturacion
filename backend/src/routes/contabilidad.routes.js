const express = require('express');
const router = express.Router();
const ContabilidadController = require('../controllers/contabilidad.controller');
const ReportesSunatService = require('../services/ReportesSunatService');

/**
 * @swagger
 * tags:
 *   name: Contabilidad
 *   description: Módulo de contabilidad y reportes SUNAT
 */

/**
 * @swagger
 * /contabilidad/plan-cuentas:
 *   get:
 *     summary: Obtener plan de cuentas
 *     description: Obtiene el plan de cuentas contables con filtros opcionales
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: integer
 *         description: Filtrar por nivel de cuenta (1, 2, 3, etc.)
 *       - in: query
 *         name: tipo
 *         schema:
 *           type: string
 *           enum: [ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, RESULTADO]
 *         description: Filtrar por tipo de cuenta
 *       - in: query
 *         name: estado
 *         schema:
 *           type: string
 *           enum: ['ACTIVO', 'INACTIVO']
 *           default: 'ACTIVO'
 *         description: Filtrar por estado de la cuenta
 *     responses:
 *       200:
 *         description: Plan de cuentas obtenido exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PlanCuentas'
 *                 total:
 *                   type: integer
 *                   example: 25
 *       500:
 *         description: Error interno del servidor
 */
router.get('/plan-cuentas', ContabilidadController.obtenerPlanCuentas);

/**
 * @swagger
 * /contabilidad/plan-cuentas:
 *   post:
 *     summary: Crear nueva cuenta contable
 *     description: Crea una nueva cuenta en el plan de cuentas
 *     tags: [Contabilidad]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - codigo
 *               - nombre
 *               - nivel
 *               - naturaleza
 *               - tipo
 *             properties:
 *               codigo:
 *                 type: string
 *                 example: "1011"
 *               nombre:
 *                 type: string
 *                 example: "Caja Moneda Nacional"
 *               descripcion:
 *                 type: string
 *                 example: "Efectivo en caja en moneda nacional"
 *               nivel:
 *                 type: integer
 *                 example: 3
 *               cuentaPadreId:
 *                 type: integer
 *                 example: 1
 *               naturaleza:
 *                 type: string
 *                 enum: ['DEUDORA', 'ACREEDORA']
 *                 example: "DEUDORA"
 *               tipo:
 *                 type: string
 *                 enum: [ACTIVO, PASIVO, PATRIMONIO, INGRESO, GASTO, RESULTADO]
 *                 example: "ACTIVO"
 *               esMovimiento:
 *                 type: boolean
 *                 example: true
 *               codigoSunat:
 *                 type: string
 *                 example: "1011"
 *     responses:
 *       201:
 *         description: Cuenta creada exitosamente
 *       400:
 *         description: Error en los datos enviados
 *       500:
 *         description: Error interno del servidor
 */
router.post('/plan-cuentas', ContabilidadController.crearCuenta);

/**
 * @swagger
 * /contabilidad/plan-cuentas/inicializar:
 *   post:
 *     summary: Inicializar plan de cuentas básico
 *     description: Crea el plan de cuentas básico según PCGE (Plan Contable General Empresarial)
 *     tags: [Contabilidad]
 *     responses:
 *       200:
 *         description: Plan de cuentas inicializado exitosamente
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
 *                   example: "Plan de cuentas inicializado exitosamente"
 *                 cuentasCreadas:
 *                   type: integer
 *                   example: 18
 *       400:
 *         description: Ya existe un plan de cuentas configurado
 *       500:
 *         description: Error interno del servidor
 */
router.post('/plan-cuentas/inicializar', ContabilidadController.inicializarPlanCuentas);

/**
 * @swagger
 * /contabilidad/libro-diario:
 *   get:
 *     summary: Obtener libro diario
 *     description: Obtiene los asientos contables del libro diario con filtros
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *         example: "2024-01-01"
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *         example: "2024-01-31"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: tipoOperacion
 *         schema:
 *           type: string
 *           enum: [VENTA, COMPRA, CAJA, INVENTARIO, AJUSTE, OTRO]
 *         description: Tipo de operación
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
 *           default: 50
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Libro diario obtenido exitosamente
 *       500:
 *         description: Error interno del servidor
 */
router.get('/libro-diario', ContabilidadController.obtenerLibroDiario);

/**
 * @swagger
 * /contabilidad/libro-mayor:
 *   get:
 *     summary: Obtener libro mayor
 *     description: Obtiene los movimientos del libro mayor para una cuenta específica
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: planCuentasId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cuenta contable
 *       - in: query
 *         name: periodo
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: fechaInicio
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio (alternativa al período)
 *       - in: query
 *         name: fechaFin
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin (alternativa al período)
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Libro mayor obtenido exitosamente
 *       400:
 *         description: Parámetros requeridos faltantes
 *       404:
 *         description: Cuenta no encontrada
 *       500:
 *         description: Error interno del servidor
 */
router.get('/libro-mayor', ContabilidadController.obtenerLibroMayor);

/**
 * @swagger
 * /contabilidad/balance-comprobacion:
 *   get:
 *     summary: Generar balance de comprobación
 *     description: Genera el balance de comprobación para un período específico
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: fechaInicio
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de inicio del período
 *       - in: query
 *         name: fechaFin
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Fecha de fin del período
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *       - in: query
 *         name: nivel
 *         schema:
 *           type: integer
 *         description: Nivel de cuentas a incluir
 *     responses:
 *       200:
 *         description: Balance de comprobación generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: array
 *                       items:
 *                         type: object
 *                     totales:
 *                       type: object
 *                     cuadrado:
 *                       type: boolean
 *       400:
 *         description: Fechas requeridas
 *       500:
 *         description: Error interno del servidor
 */
router.get('/balance-comprobacion', ContabilidadController.generarBalanceComprobacion);

// RUTAS PARA REPORTES SUNAT

/**
 * @swagger
 * /contabilidad/reportes-sunat/libro-diario:
 *   get:
 *     summary: Generar Libro Diario Electrónico (Formato 5.1)
 *     description: Genera el libro diario en formato requerido por SUNAT
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Libro diario electrónico generado exitosamente
 *       400:
 *         description: Período requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes-sunat/libro-diario', async (req, res) => {
  try {
    const { periodo, sucursalId } = req.query;
    
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const reporte = await ReportesSunatService.generarLibroDiario(periodo, sucursalId);
    
    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error al generar libro diario SUNAT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el libro diario electrónico',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /contabilidad/reportes-sunat/libro-mayor:
 *   get:
 *     summary: Generar Libro Mayor Electrónico (Formato 6.1)
 *     description: Genera el libro mayor en formato requerido por SUNAT
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Libro mayor electrónico generado exitosamente
 *       400:
 *         description: Período requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes-sunat/libro-mayor', async (req, res) => {
  try {
    const { periodo, sucursalId } = req.query;
    
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const reporte = await ReportesSunatService.generarLibroMayor(periodo, sucursalId);
    
    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error al generar libro mayor SUNAT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el libro mayor electrónico',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /contabilidad/reportes-sunat/registro-ventas:
 *   get:
 *     summary: Generar Registro de Ventas e Ingresos (Formato 14.1)
 *     description: Genera el registro de ventas en formato requerido por SUNAT
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Registro de ventas generado exitosamente
 *       400:
 *         description: Período requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes-sunat/registro-ventas', async (req, res) => {
  try {
    const { periodo, sucursalId } = req.query;
    
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const reporte = await ReportesSunatService.generarRegistroVentas(periodo, sucursalId);
    
    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error al generar registro de ventas SUNAT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el registro de ventas',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /contabilidad/reportes-sunat/registro-compras:
 *   get:
 *     summary: Generar Registro de Compras (Formato 8.1)
 *     description: Genera el registro de compras en formato requerido por SUNAT
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Registro de compras generado exitosamente
 *       400:
 *         description: Período requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes-sunat/registro-compras', async (req, res) => {
  try {
    const { periodo, sucursalId } = req.query;
    
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const reporte = await ReportesSunatService.generarRegistroCompras(periodo, sucursalId);
    
    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error al generar registro de compras SUNAT:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el registro de compras',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /contabilidad/reportes-sunat/declaracion-mensual:
 *   get:
 *     summary: Generar reporte consolidado para declaración mensual
 *     description: Genera todos los reportes necesarios para la declaración mensual de SUNAT
 *     tags: [Contabilidad]
 *     parameters:
 *       - in: query
 *         name: periodo
 *         required: true
 *         schema:
 *           type: string
 *         description: Período en formato YYYY-MM
 *         example: "2024-01"
 *       - in: query
 *         name: sucursalId
 *         schema:
 *           type: integer
 *         description: ID de la sucursal
 *     responses:
 *       200:
 *         description: Reporte consolidado generado exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     periodo:
 *                       type: string
 *                       example: "2024-01"
 *                     registroVentas:
 *                       type: object
 *                     registroCompras:
 *                       type: object
 *                     libroMayor:
 *                       type: object
 *                     balanceComprobacion:
 *                       type: object
 *                     resumenIGV:
 *                       type: object
 *                       properties:
 *                         igvVentas:
 *                           type: number
 *                         igvCompras:
 *                           type: number
 *                         igvPorPagar:
 *                           type: number
 *       400:
 *         description: Período requerido
 *       500:
 *         description: Error interno del servidor
 */
router.get('/reportes-sunat/declaracion-mensual', async (req, res) => {
  try {
    const { periodo, sucursalId } = req.query;
    
    if (!periodo) {
      return res.status(400).json({
        success: false,
        message: 'El período es requerido (formato: YYYY-MM)'
      });
    }

    const reporte = await ReportesSunatService.generarReporteDeclaracionMensual(periodo, sucursalId);
    
    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('Error al generar reporte de declaración mensual:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar el reporte de declaración mensual',
      error: error.message
    });
  }
});

module.exports = router;