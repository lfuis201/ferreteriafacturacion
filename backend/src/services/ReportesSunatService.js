const { 
  PlanCuentas, 
  AsientoContable, 
  DetalleAsiento, 
  LibroMayor,
  Venta,
  Compra,
  Cliente,
  Proveedor,
  Sucursal,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Servicio para generar reportes contables requeridos por SUNAT
 * Incluye libros electrónicos y reportes para declaraciones
 */
class ReportesSunatService {

  /**
   * Validar y formatear período
   */
  static validarPeriodo(periodo) {
    if (!periodo || typeof periodo !== 'string') {
      throw new Error('El período es requerido y debe ser una cadena de texto');
    }

    // Validar formato YYYY-MM
    if (!periodo.match(/^\d{4}-\d{2}$/)) {
      throw new Error('Formato de período inválido. Use YYYY-MM (ejemplo: 2024-01)');
    }

    const [year, month] = periodo.split('-');
    const yearNum = parseInt(year);
    const monthNum = parseInt(month);

    // Validar año (entre 2000 y 2100)
    if (yearNum < 2000 || yearNum > 2100) {
      throw new Error('El año debe estar entre 2000 y 2100');
    }

    // Validar mes (entre 1 y 12)
    if (monthNum < 1 || monthNum > 12) {
      throw new Error('El mes debe estar entre 01 y 12');
    } 
    

    const fechaInicio = `${year}-${month.padStart(2, '0')}-01`;
    
    // Validar que la fecha sea válida usando moment
    const momentFechaInicio = moment(fechaInicio, 'YYYY-MM-DD', true);
    if (!momentFechaInicio.isValid()) {
      throw new Error('Fecha de inicio inválida');
    }

    const fechaFin = momentFechaInicio.clone().endOf('month').format('YYYY-MM-DD');
    
    return { fechaInicio, fechaFin, year, month };
  }

  /**
   * Generar Libro Diario Electrónico (Formato 5.1)
   * Requerido para empresas que superen las 500 UIT de ingresos brutos anuales
   */
  static async generarLibroDiario(periodo, sucursalId = null) {
    try {
      // Validar y formatear período
      const { fechaInicio, fechaFin } = this.validarPeriodo(periodo);

      const whereClause = {
        fecha: { [Op.between]: [fechaInicio, fechaFin] },
        estado: 'CONFIRMADO'
      };

      if (sucursalId) whereClause.sucursalId = sucursalId;

      const asientos = await AsientoContable.findAll({
        where: whereClause,
        include: [
          {
            model: DetalleAsiento,
            include: [
              {
                model: PlanCuentas,
                attributes: ['codigo', 'nombre']
              }
            ],
            order: [['orden', 'ASC']]
          }
        ],
        order: [['fecha', 'ASC'], ['numero', 'ASC']]
      });

      // Formato para SUNAT (Libro Diario 5.1)
      const registros = [];
      let correlativo = 1;

      asientos.forEach(asiento => {
        asiento.DetalleAsientos.forEach(detalle => {
          registros.push({
            periodo: periodo.replace('-', ''),
            cuo: correlativo.toString().padStart(10, '0'), // Código Único de Operación
            correlativo: correlativo.toString().padStart(10, '0'),
            fechaContable: moment(asiento.fecha).format('DD/MM/YYYY'),
            glosa: asiento.glosa.substring(0, 200), // Máximo 200 caracteres
            glosaDet: detalle.glosa.substring(0, 200),
            cuentaContable: detalle.PlanCuentas.codigo,
            codigoMoneda: detalle.moneda || 'PEN',
            tipoDocumento: this.obtenerTipoDocumento(asiento.tipoOperacion),
            numeroDocumento: asiento.documentoReferencia || '',
            debe: parseFloat(detalle.debe).toFixed(2),
            haber: parseFloat(detalle.haber).toFixed(2),
            datoEstructurado: '', // Para uso futuro
            estadoOperacion: '1' // 1: Activo, 8: Anulado, 9: Ajuste
          });
          correlativo++;
        });
      });

      return {
        periodo,
        totalRegistros: registros.length,
        registros
      };

    } catch (error) {
      console.error('Error al generar libro diario:', error);
      throw error;
    }
  }

  /**
   * Generar Libro Mayor Electrónico (Formato 6.1)
   */
  static async generarLibroMayor(periodo, sucursalId = null) {
    try {
      // Validar y formatear período
      const { fechaInicio, fechaFin } = this.validarPeriodo(periodo);

      // Obtener todas las cuentas con movimientos usando consulta SQL directa
      const sucursalCondition = sucursalId ? 'AND ac.sucursalId = :sucursalId' : '';
      
      const cuentasConMovimientos = await sequelize.query(`
        SELECT DISTINCT pc.id, pc.codigo, pc.nombre, pc.naturaleza
        FROM PlanCuentas pc
        INNER JOIN DetallesAsientos da ON pc.id = da.planCuentasId
        INNER JOIN AsientosContables ac ON da.asientoContableId = ac.id
        WHERE ac.fecha BETWEEN :fechaInicio AND :fechaFin
          AND ac.estado = 'CONFIRMADO'
          ${sucursalCondition}
        ORDER BY pc.codigo ASC
      `, {
        replacements: { 
          fechaInicio,
          fechaFin,
          ...(sucursalId && { sucursalId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const registros = [];

      for (const cuenta of cuentasConMovimientos) {
        // Calcular saldo inicial (movimientos anteriores al período)
        const saldoInicialQuery = await sequelize.query(`
          SELECT 
            COALESCE(SUM(da.debe), 0) as totalDebe,
            COALESCE(SUM(da.haber), 0) as totalHaber
          FROM DetallesAsientos da
          INNER JOIN AsientosContables ac ON da.asientoContableId = ac.id
          WHERE da.planCuentasId = :planCuentasId
            AND ac.fecha < :fechaInicio
            AND ac.estado = 'CONFIRMADO'
            ${sucursalCondition}
        `, {
          replacements: { 
            planCuentasId: cuenta.id, 
            fechaInicio,
            ...(sucursalId && { sucursalId })
          },
          type: sequelize.QueryTypes.SELECT
        });

        const saldoInicial = saldoInicialQuery[0];
        const debeInicial = parseFloat(saldoInicial.totalDebe) || 0;
        const haberInicial = parseFloat(saldoInicial.totalHaber) || 0;
        
        let saldoInicialDeudor = 0;
        let saldoInicialAcreedor = 0;
        
        if (cuenta.naturaleza === 'DEUDORA') {
          const diferencia = debeInicial - haberInicial;
          if (diferencia > 0) {
            saldoInicialDeudor = diferencia;
          } else {
            saldoInicialAcreedor = Math.abs(diferencia);
          }
        } else {
          const diferencia = haberInicial - debeInicial;
          if (diferencia > 0) {
            saldoInicialAcreedor = diferencia;
          } else {
            saldoInicialDeudor = Math.abs(diferencia);
          }
        }

        // Calcular movimientos del período
        const movimientosPeriodo = await sequelize.query(`
          SELECT 
            COALESCE(SUM(da.debe), 0) as totalDebe,
            COALESCE(SUM(da.haber), 0) as totalHaber
          FROM DetallesAsientos da
          INNER JOIN AsientosContables ac ON da.asientoContableId = ac.id
          WHERE da.planCuentasId = :planCuentasId
            AND ac.fecha BETWEEN :fechaInicio AND :fechaFin
            AND ac.estado = 'CONFIRMADO'
            ${sucursalCondition}
        `, {
          replacements: { 
            planCuentasId: cuenta.id, 
            fechaInicio,
            fechaFin,
            ...(sucursalId && { sucursalId })
          },
          type: sequelize.QueryTypes.SELECT
        });

        const movimientos = movimientosPeriodo[0];
        const debePeriodo = parseFloat(movimientos.totalDebe) || 0;
        const haberPeriodo = parseFloat(movimientos.totalHaber) || 0;

        // Calcular saldo final
        const totalDebe = debeInicial + debePeriodo;
        const totalHaber = haberInicial + haberPeriodo;
        
        let saldoFinalDeudor = 0;
        let saldoFinalAcreedor = 0;
        
        if (cuenta.naturaleza === 'DEUDORA') {
          const diferencia = totalDebe - totalHaber;
          if (diferencia > 0) {
            saldoFinalDeudor = diferencia;
          } else {
            saldoFinalAcreedor = Math.abs(diferencia);
          }
        } else {
          const diferencia = totalHaber - totalDebe;
          if (diferencia > 0) {
            saldoFinalAcreedor = diferencia;
          } else {
            saldoFinalDeudor = Math.abs(diferencia);
          }
        }

        registros.push({
          periodo: periodo.replace('-', ''),
          cuentaContable: cuenta.codigo,
          denominacion: cuenta.nombre,
          saldoInicialDeudor: saldoInicialDeudor.toFixed(2),
          saldoInicialAcreedor: saldoInicialAcreedor.toFixed(2),
          debePeriodo: debePeriodo.toFixed(2),
          haberPeriodo: haberPeriodo.toFixed(2),
          saldoFinalDeudor: saldoFinalDeudor.toFixed(2),
          saldoFinalAcreedor: saldoFinalAcreedor.toFixed(2),
          estadoOperacion: '1'
        });
      }

      return {
        periodo,
        totalRegistros: registros.length,
        registros
      };

    } catch (error) {
      console.error('Error al generar libro mayor:', error);
      throw error;
    }
  }

  /**
   * Generar Registro de Ventas e Ingresos (Formato 14.1)
   */
  static async generarRegistroVentas(periodo, sucursalId = null) {
    try {
      // Validar y formatear período
      const { fechaInicio, fechaFin } = this.validarPeriodo(periodo);

      const whereClause = {
        fechaVenta: { [Op.between]: [fechaInicio, fechaFin] },
        estado: 'COMPLETADA',
        tipoComprobante: { [Op.in]: ['FACTURA', 'BOLETA'] }
      };

      if (sucursalId) whereClause.sucursalId = sucursalId;

      const ventas = await Venta.findAll({
        where: whereClause,
        include: [
          {
            model: Cliente,
            attributes: ['numeroDocumento', 'tipoDocumento', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'nombres']
          }
        ],
        order: [['fechaVenta', 'ASC'], ['serieComprobante', 'ASC'], ['numeroComprobante', 'ASC']]
      });

      const registros = ventas.map((venta, index) => {
        const cliente = venta.Cliente || {};
        // Construir nombre completo del cliente
        let nombreCliente = '';
        if (cliente.nombres && (cliente.apellidoPaterno || cliente.apellidoMaterno)) {
          // Persona natural
          nombreCliente = `${cliente.nombres || ''} ${cliente.apellidoPaterno || ''} ${cliente.apellidoMaterno || ''}`.trim();
        } else {
          // Empresa o nombre simple
          nombreCliente = cliente.nombre || '';
        }

        return {
          periodo: periodo.replace('-', ''),
          cuo: (index + 1).toString().padStart(10, '0'),
          correlativo: (index + 1).toString().padStart(10, '0'),
          fechaEmision: moment(venta.fechaVenta).format('DD/MM/YYYY'),
          fechaVencimiento: moment(venta.fechaVenta).format('DD/MM/YYYY'), // Para ventas al contado
          tipoComprobante: venta.tipoComprobante === 'FACTURA' ? '01' : '03',
          serieComprobante: venta.serieComprobante,
          numeroComprobante: venta.numeroComprobante,
          numeroFinal: '', // Para comprobantes con rango
          tipoDocumentoCliente: this.obtenerTipoDocumentoSunat(cliente.tipoDocumento),
          numeroDocumentoCliente: cliente.numeroDocumento || '',
          apellidosNombresRazonSocial: nombreCliente.substring(0, 60),
          valorExportacion: '0.00',
          baseImponibleGravada: parseFloat(venta.subtotal).toFixed(2),
          descuentoBaseImponible: '0.00',
          igv: parseFloat(venta.igv).toFixed(2),
          descuentoIgv: '0.00',
          montoExonerado: '0.00',
          montoInafecto: '0.00',
          isc: '0.00',
          baseImponibleIvap: '0.00',
          ivap: '0.00',
          icbper: '0.00',
          otrosTributos: '0.00',
          importeTotal: parseFloat(venta.total).toFixed(2),
          codigoMoneda: venta.moneda,
          tipoCambio: venta.tipoCambio || '1.000',
          fechaEmisionModificado: '',
          tipoComprobanteModificado: '',
          serieComprobanteModificado: '',
          numeroComprobanteModificado: '',
          proyectoOperacionAtribucionRenta: '',
          estadoOperacion: venta.estado === 'ANULADA' ? '2' : '1',
          campoLibre: ''
        };
      });

      return {
        periodo,
        totalRegistros: registros.length,
        registros,
        resumen: {
          totalVentas: registros.length,
          montoTotalVentas: registros.reduce((sum, reg) => sum + parseFloat(reg.importeTotal), 0),
          totalIGV: registros.reduce((sum, reg) => sum + parseFloat(reg.igv), 0)
        }
      };

    } catch (error) {
      console.error('Error al generar registro de ventas:', error);
      throw error;
    }
  }

  /**
   * Generar Registro de Compras (Formato 8.1)
   */
  static async generarRegistroCompras(periodo, sucursalId = null) {
    try {
      // Validar y formatear período
      const { fechaInicio, fechaFin } = this.validarPeriodo(periodo);

      const whereClause = {
        fechaCompra: { [Op.between]: [fechaInicio, fechaFin] },
        estado: 'COMPLETADA'
      };

      if (sucursalId) whereClause.sucursalId = sucursalId;

      const compras = await Compra.findAll({
        where: whereClause,
        include: [
          {
            model: Proveedor,
            attributes: ['ruc', 'nombre']
          }
        ],
        order: [['fechaCompra', 'ASC']]
      });

      const registros = compras.map((compra, index) => {
        const proveedor = compra.Proveedor || {};
        const nombreProveedor = proveedor.razonSocial || proveedor.nombre || '';

        return {
          periodo: periodo.replace('-', ''),
          cuo: (index + 1).toString().padStart(10, '0'),
          correlativo: (index + 1).toString().padStart(10, '0'),
          fechaEmision: moment(compra.fechaCompra).format('DD/MM/YYYY'),
          fechaVencimiento: moment(compra.fechaCompra).format('DD/MM/YYYY'),
          tipoComprobante: compra.tipoComprobante === 'FACTURA' ? '01' : '03',
          serieComprobante: compra.serieComprobante || '',
          anioDua: '',
          numeroComprobante: compra.numeroComprobante || '',
          numeroFinal: '',
          tipoDocumentoProveedor: this.obtenerTipoDocumentoSunat(proveedor.tipoDocumento),
          numeroDocumentoProveedor: proveedor.numeroDocumento || '',
          apellidosNombresRazonSocial: nombreProveedor.substring(0, 60),
          baseImponibleAdquisicionesGravadas: parseFloat(compra.subtotal).toFixed(2),
          igv: parseFloat(compra.igv).toFixed(2),
          baseImponibleAdquisicionesGravadasNoDerechoCredito: '0.00',
          igvNoDerechoCredito: '0.00',
          adquisicionesExoneradas: '0.00',
          adquisicionesInafectas: '0.00',
          isc: '0.00',
          icbper: '0.00',
          otrosTributos: '0.00',
          importeTotal: parseFloat(compra.total).toFixed(2),
          codigoMoneda: 'PEN',
          tipoCambio: '1.000',
          fechaEmisionModificado: '',
          tipoComprobanteModificado: '',
          serieComprobanteModificado: '',
          numeroComprobanteModificado: '',
          fechaEmisionDetraccion: '',
          numeroConstanciaDetraccion: '',
          marcaRetencionSujetoRetencion: '',
          clasificacionBienesServicios: '',
          identificacionContrato: '',
          errorTipo1: '',
          indicadorComprobantePago: '',
          estadoOperacion: compra.estado === 'ANULADA' ? '2' : '1',
          campoLibre: ''
        };
      });

      return {
        periodo,
        totalRegistros: registros.length,
        registros,
        resumen: {
          totalCompras: registros.length,
          montoTotalCompras: registros.reduce((sum, reg) => sum + parseFloat(reg.importeTotal), 0),
          totalIGV: registros.reduce((sum, reg) => sum + parseFloat(reg.igv), 0)
        }
      };

    } catch (error) {
      console.error('Error al generar registro de compras:', error);
      throw error;
    }
  }

  /**
   * Generar Balance de Comprobación para SUNAT
   */
  static async generarBalanceComprobacionSunat(periodo, sucursalId = null) {
    try {
      // Validar y formatear período
      const { fechaInicio, fechaFin } = this.validarPeriodo(periodo);

      // Usar consulta SQL directa para evitar problemas con GROUP BY
      const sucursalCondition = sucursalId ? 'AND ac.sucursalId = :sucursalId' : '';
      
      const movimientosPorCuenta = await sequelize.query(`
        SELECT 
          pc.id,
          pc.codigo,
          pc.nombre,
          pc.naturaleza,
          COALESCE(SUM(da.debe), 0) as totalDebe,
          COALESCE(SUM(da.haber), 0) as totalHaber
        FROM PlanCuentas pc
        LEFT JOIN DetallesAsientos da ON pc.id = da.planCuentasId
        LEFT JOIN AsientosContables ac ON da.asientoContableId = ac.id 
          AND ac.fecha BETWEEN :fechaInicio AND :fechaFin
          AND ac.estado = 'CONFIRMADO'
          ${sucursalCondition}
        WHERE pc.estado = 'ACTIVO'
        GROUP BY pc.id, pc.codigo, pc.nombre, pc.naturaleza
        HAVING COALESCE(SUM(da.debe), 0) > 0 OR COALESCE(SUM(da.haber), 0) > 0
        ORDER BY pc.codigo ASC
      `, {
        replacements: { 
          fechaInicio,
          fechaFin,
          ...(sucursalId && { sucursalId })
        },
        type: sequelize.QueryTypes.SELECT
      });

      const registros = movimientosPorCuenta.map(cuenta => {
        const totalDebe = parseFloat(cuenta.totalDebe) || 0;
        const totalHaber = parseFloat(cuenta.totalHaber) || 0;
        
        let saldoDeudor = 0;
        let saldoAcreedor = 0;
        
        const diferencia = totalDebe - totalHaber;
        
        if (cuenta.naturaleza === 'DEUDORA') {
          if (diferencia > 0) {
            saldoDeudor = diferencia;
          } else {
            saldoAcreedor = Math.abs(diferencia);
          }
        } else {
          if (diferencia < 0) {
            saldoAcreedor = Math.abs(diferencia);
          } else {
            saldoDeudor = diferencia;
          }
        }

        return {
          cuentaContable: cuenta.codigo,
          denominacion: cuenta.nombre,
          debe: totalDebe.toFixed(2),
          haber: totalHaber.toFixed(2),
          saldoDeudor: saldoDeudor.toFixed(2),
          saldoAcreedor: saldoAcreedor.toFixed(2)
        };
      });

      // Calcular totales
      const totales = registros.reduce((acc, reg) => {
        acc.totalDebe += parseFloat(reg.debe);
        acc.totalHaber += parseFloat(reg.haber);
        acc.totalSaldoDeudor += parseFloat(reg.saldoDeudor);
        acc.totalSaldoAcreedor += parseFloat(reg.saldoAcreedor);
        return acc;
      }, {
        totalDebe: 0,
        totalHaber: 0,
        totalSaldoDeudor: 0,
        totalSaldoAcreedor: 0
      });

      return {
        periodo,
        totalRegistros: registros.length,
        registros,
        totales: {
          totalDebe: totales.totalDebe.toFixed(2),
          totalHaber: totales.totalHaber.toFixed(2),
          totalSaldoDeudor: totales.totalSaldoDeudor.toFixed(2),
          totalSaldoAcreedor: totales.totalSaldoAcreedor.toFixed(2)
        },
        cuadrado: Math.abs(totales.totalDebe - totales.totalHaber) < 0.01 &&
                 Math.abs(totales.totalSaldoDeudor - totales.totalSaldoAcreedor) < 0.01
      };

    } catch (error) {
      console.error('Error al generar balance de comprobación:', error);
      throw error;
    }
  }

  /**
   * Obtener tipo de documento para SUNAT
   */
  static obtenerTipoDocumentoSunat(tipoDocumento) {
    const tipos = {
      'DNI': '1',
      'RUC': '6',
      'CARNET_EXTRANJERIA': '4',
      'PASAPORTE': '7',
      'CEDULA_DIPLOMATICA': 'A'
    };
    return tipos[tipoDocumento] || '0';
  }

  /**
   * Obtener tipo de documento según operación
   */
  static obtenerTipoDocumento(tipoOperacion) {
    const tipos = {
      'VENTA': '01', // Factura
      'COMPRA': '01', // Factura
      'CAJA': '00', // Otros
      'INVENTARIO': '00', // Otros
      'AJUSTE': '00' // Otros
    };
    return tipos[tipoOperacion] || '00';
  }

  /**
   * Generar reporte consolidado para declaración mensual
   */
  static async generarReporteDeclaracionMensual(periodo, sucursalId = null) {
    try {
      const [registroVentas, registroCompras, libroMayor, balanceComprobacion] = await Promise.all([
        this.generarRegistroVentas(periodo, sucursalId),
        this.generarRegistroCompras(periodo, sucursalId),
        this.generarLibroMayor(periodo, sucursalId),
        this.generarBalanceComprobacionSunat(periodo, sucursalId)
      ]);

      return {
        periodo,
        sucursalId,
        fechaGeneracion: moment().format('YYYY-MM-DD HH:mm:ss'),
        registroVentas,
        registroCompras,
        libroMayor,
        balanceComprobacion,
        resumenIGV: {
          igvVentas: registroVentas.resumen.totalIGV,
          igvCompras: registroCompras.resumen.totalIGV,
          igvPorPagar: registroVentas.resumen.totalIGV - registroCompras.resumen.totalIGV
        }
      };

    } catch (error) {
      console.error('Error al generar reporte de declaración mensual:', error);
      throw error;
    }
  }
}

module.exports = ReportesSunatService;