const ContabilidadController = require('../controllers/contabilidad.controller');

/**
 * Middleware para generar asientos contables automáticamente
 * Se ejecuta después de operaciones de venta y compra
 */

/**
 * Middleware para generar asiento contable después de una venta
 */
const generarAsientoVenta = async (req, res, next) => {
  try {
    // Solo generar asiento si la venta fue exitosa y es FACTURA o BOLETA
    if (res.locals.ventaCreada && res.locals.ventaCreada.tipoComprobante && 
        ['FACTURA', 'BOLETA'].includes(res.locals.ventaCreada.tipoComprobante)) {
      
      console.log('🧾 Generando asiento contable para venta:', res.locals.ventaCreada.id);
      
      try {
        const asiento = await ContabilidadController.generarAsientoVenta(
          res.locals.ventaCreada.id,
          res.locals.ventaCreada.usuarioId,
          res.locals.transaction
        );
        
        console.log('✅ Asiento contable generado:', asiento.numero);
        res.locals.asientoGenerado = asiento;
        
      } catch (error) {
        console.error('❌ Error al generar asiento contable para venta:', error.message);
        // No interrumpir el flujo, solo registrar el error
        res.locals.errorAsiento = error.message;
      }
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Error en middleware de contabilidad (venta):', error);
    next(); // Continuar sin interrumpir
  }
};

/**
 * Middleware para generar asiento contable después de una compra
 */
const generarAsientoCompra = async (req, res, next) => {
  try {
    // Solo generar asiento si la compra fue exitosa
    if (res.locals.compraCreada && res.locals.compraCreada.estado === 'COMPLETADA') {
      
      console.log('🧾 Generando asiento contable para compra:', res.locals.compraCreada.id);
      
      try {
        const asiento = await ContabilidadController.generarAsientoCompra(
          res.locals.compraCreada.id,
          res.locals.compraCreada.usuarioId,
          res.locals.transaction
        );
        
        console.log('✅ Asiento contable generado:', asiento.numero);
        res.locals.asientoGenerado = asiento;
        
      } catch (error) {
        console.error('❌ Error al generar asiento contable para compra:', error.message);
        // No interrumpir el flujo, solo registrar el error
        res.locals.errorAsiento = error.message;
      }
    }
    
    next();
    
  } catch (error) {
    console.error('❌ Error en middleware de contabilidad (compra):', error);
    next(); // Continuar sin interrumpir
  }
};

/**
 * Middleware para incluir información del asiento en la respuesta
 */
const incluirInfoAsiento = (req, res, next) => {
  // Modificar la respuesta original para incluir información del asiento
  const originalJson = res.json;
  
  res.json = function(data) {
    // Si se generó un asiento, incluir la información
    if (res.locals.asientoGenerado) {
      data.asientoContable = {
        id: res.locals.asientoGenerado.id,
        numero: res.locals.asientoGenerado.numero,
        fecha: res.locals.asientoGenerado.fecha,
        totalDebe: res.locals.asientoGenerado.totalDebe,
        totalHaber: res.locals.asientoGenerado.totalHaber,
        estado: res.locals.asientoGenerado.estado
      };
    }
    
    // Si hubo error al generar asiento, incluir la información
    if (res.locals.errorAsiento) {
      data.advertenciaContable = {
        mensaje: 'No se pudo generar el asiento contable automáticamente',
        error: res.locals.errorAsiento,
        solucion: 'Puede generar el asiento manualmente desde el módulo de contabilidad'
      };
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

/**
 * Middleware combinado para ventas
 */
const middlewareContabilidadVenta = [
  incluirInfoAsiento,
  generarAsientoVenta
];

/**
 * Middleware combinado para compras
 */
const middlewareContabilidadCompra = [
  incluirInfoAsiento,
  generarAsientoCompra
];

/**
 * Función helper para verificar si el módulo de contabilidad está inicializado
 */
const verificarModuloContabilidad = async () => {
  try {
    const { PlanCuentas } = require('../models');
    const cuentasCount = await PlanCuentas.count();
    return cuentasCount > 0;
  } catch (error) {
    console.error('Error al verificar módulo de contabilidad:', error);
    return false;
  }
};

/**
 * Middleware para verificar que el módulo de contabilidad esté inicializado
 */
const verificarInicializacion = async (req, res, next) => {
  try {
    const inicializado = await verificarModuloContabilidad();
    
    if (!inicializado) {
      console.warn('⚠️ Módulo de contabilidad no inicializado. Ejecute: node scripts/inicializar-contabilidad.js');
    }
    
    res.locals.contabilidadInicializada = inicializado;
    next();
    
  } catch (error) {
    console.error('Error al verificar inicialización de contabilidad:', error);
    res.locals.contabilidadInicializada = false;
    next();
  }
};

module.exports = {
  generarAsientoVenta,
  generarAsientoCompra,
  incluirInfoAsiento,
  middlewareContabilidadVenta,
  middlewareContabilidadCompra,
  verificarModuloContabilidad,
  verificarInicializacion
};