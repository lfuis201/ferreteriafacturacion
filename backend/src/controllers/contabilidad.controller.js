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
  Usuario,
  sequelize 
} = require('../models');
const { Op } = require('sequelize');
const moment = require('moment');

/**
 * Controlador de Contabilidad
 * Maneja todas las operaciones contables del sistema
 */
class ContabilidadController {

  /**
   * Obtener el plan de cuentas
   */
  static async obtenerPlanCuentas(req, res) {
    try {
      const { nivel, tipo, estado = 'ACTIVO' } = req.query;
      
      const whereClause = { estado };
      
      if (nivel) whereClause.nivel = nivel;
      if (tipo) whereClause.tipo = tipo;

      const cuentas = await PlanCuentas.findAll({
        where: whereClause,
        include: [
          {
            model: PlanCuentas,
            as: 'CuentaPadre',
            attributes: ['id', 'codigo', 'nombre']
          },
          {
            model: PlanCuentas,
            as: 'CuentasHijas',
            attributes: ['id', 'codigo', 'nombre', 'nivel']
          }
        ],
        order: [['codigo', 'ASC']]
      });

      res.json({
        success: true,
        data: cuentas,
        total: cuentas.length
      });

    } catch (error) {
      console.error('Error al obtener plan de cuentas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el plan de cuentas',
        error: error.message
      });
    }
  }

  /**
   * Crear una nueva cuenta contable
   */
  static async crearCuenta(req, res) {
    try {
      const {
        codigo,
        nombre,
        descripcion,
        nivel,
        cuentaPadreId,
        naturaleza,
        tipo,
        esMovimiento = true,
        codigoSunat
      } = req.body;

      // Validar que el código no exista
      const cuentaExistente = await PlanCuentas.findOne({ where: { codigo } });
      if (cuentaExistente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe una cuenta con este código'
        });
      }

      // Validar cuenta padre si se especifica
      if (cuentaPadreId) {
        const cuentaPadre = await PlanCuentas.findByPk(cuentaPadreId);
        if (!cuentaPadre) {
          return res.status(400).json({
            success: false,
            message: 'La cuenta padre especificada no existe'
          });
        }
      }

      const nuevaCuenta = await PlanCuentas.create({
        codigo,
        nombre,
        descripcion,
        nivel,
        cuentaPadreId,
        naturaleza,
        tipo,
        esMovimiento,
        codigoSunat
      });

      res.status(201).json({
        success: true,
        message: 'Cuenta creada exitosamente',
        data: nuevaCuenta
      });

    } catch (error) {
      console.error('Error al crear cuenta:', error);
      res.status(500).json({
        success: false,
        message: 'Error al crear la cuenta',
        error: error.message
      });
    }
  }

  /**
   * Generar asiento contable automático para una venta
   */
  static async generarAsientoVenta(ventaId, usuarioId, transaction = null) {
    try {
      const venta = await Venta.findByPk(ventaId, {
        include: [
          { model: Cliente, attributes: ['id', 'nombre', 'apellidoPaterno', 'apellidoMaterno', 'nombres'] },
          { model: Sucursal, attributes: ['id', 'nombre'] }
        ],
        transaction
      });

      if (!venta) {
        throw new Error('Venta no encontrada');
      }

      // Generar número de asiento
      const fechaActual = moment().format('YYYY-MM-DD');
      const ultimoAsiento = await AsientoContable.findOne({
        where: {
          fecha: fechaActual,
          sucursalId: venta.sucursalId
        },
        order: [['numero', 'DESC']],
        transaction
      });

      const numeroAsiento = ultimoAsiento 
        ? `ASI-${String(parseInt(ultimoAsiento.numero.split('-')[1]) + 1).padStart(6, '0')}`
        : 'ASI-000001';

      // Crear asiento contable
      const asiento = await AsientoContable.create({
        numero: numeroAsiento,
        fecha: fechaActual,
        glosa: `Venta ${venta.tipoComprobante} ${venta.serieComprobante}-${venta.numeroComprobante}`,
        tipoOperacion: 'VENTA',
        documentoReferencia: `${venta.serieComprobante}-${venta.numeroComprobante}`,
        ventaId: venta.id,
        sucursalId: venta.sucursalId,
        usuarioId: usuarioId,
        estado: 'CONFIRMADO',
        esAutomatico: true
      }, { transaction });

      // Buscar cuentas contables necesarias
      const cuentaEfectivo = await PlanCuentas.findOne({ 
        where: { codigo: '101' }, // Caja
        transaction 
      });
      const cuentaVentas = await PlanCuentas.findOne({ 
        where: { codigo: '701' }, // Ventas
        transaction 
      });
      const cuentaIGV = await PlanCuentas.findOne({ 
        where: { codigo: '4011' }, // IGV por pagar
        transaction 
      });

      if (!cuentaEfectivo || !cuentaVentas || !cuentaIGV) {
        throw new Error('No se encontraron las cuentas contables necesarias');
      }

      const detalles = [];

      // Débito: Efectivo (total de la venta)
      detalles.push({
        asientoContableId: asiento.id,
        planCuentasId: cuentaEfectivo.id,
        orden: 1,
        glosa: `Cobro ${venta.tipoComprobante} ${venta.serieComprobante}-${venta.numeroComprobante}`,
        debe: parseFloat(venta.total),
        haber: 0,
        clienteId: venta.clienteId,
        moneda: venta.moneda
      });

      // Crédito: Ventas (subtotal)
      detalles.push({
        asientoContableId: asiento.id,
        planCuentasId: cuentaVentas.id,
        orden: 2,
        glosa: `Venta de mercadería`,
        debe: 0,
        haber: parseFloat(venta.subtotal),
        clienteId: venta.clienteId,
        moneda: venta.moneda
      });

      // Crédito: IGV por pagar (si hay IGV)
      if (parseFloat(venta.igv) > 0) {
        detalles.push({
          asientoContableId: asiento.id,
          planCuentasId: cuentaIGV.id,
          orden: 3,
          glosa: `IGV de la venta`,
          debe: 0,
          haber: parseFloat(venta.igv),
          moneda: venta.moneda
        });
      }

      // Crear detalles del asiento
      await DetalleAsiento.bulkCreate(detalles, { transaction });

      // Actualizar totales del asiento
      const totalDebe = detalles.reduce((sum, det) => sum + parseFloat(det.debe), 0);
      const totalHaber = detalles.reduce((sum, det) => sum + parseFloat(det.haber), 0);

      await asiento.update({
        totalDebe,
        totalHaber,
        diferencia: totalDebe - totalHaber
      }, { transaction });

      // Actualizar LibroMayor
      await this.actualizarLibroMayor(detalles, venta.sucursalId, transaction);

      return asiento;

    } catch (error) {
      console.error('Error al generar asiento de venta:', error);
      throw error;
    }
  }

  /**
   * Actualizar LibroMayor con los movimientos de los detalles del asiento
   */
  static async actualizarLibroMayor(detalles, sucursalId, transaction = null) {
    try {
      const fechaActual = new Date();
      const periodo = `${fechaActual.getFullYear()}-${String(fechaActual.getMonth() + 1).padStart(2, '0')}`;

      for (const detalle of detalles) {
        // Buscar o crear registro en LibroMayor para esta cuenta y período
        const [libroMayor, created] = await LibroMayor.findOrCreate({
          where: {
            planCuentasId: detalle.planCuentasId,
            periodo: periodo,
            sucursalId: sucursalId
          },
          defaults: {
            planCuentasId: detalle.planCuentasId,
            periodo: periodo,
            sucursalId: sucursalId,
            saldoInicialDebe: 0,
            saldoInicialHaber: 0,
            movimientosDebe: 0,
            movimientosHaber: 0,
            saldoFinalDebe: 0,
            saldoFinalHaber: 0,
            saldoDeudor: 0,
            saldoAcreedor: 0,
            estado: 'ABIERTO'
          },
          transaction
        });

        // Actualizar movimientos
        const nuevoMovimientosDebe = parseFloat(libroMayor.movimientosDebe) + parseFloat(detalle.debe || 0);
        const nuevoMovimientosHaber = parseFloat(libroMayor.movimientosHaber) + parseFloat(detalle.haber || 0);
        
        // Calcular saldos finales
        const totalDebe = parseFloat(libroMayor.saldoInicialDebe) + nuevoMovimientosDebe;
        const totalHaber = parseFloat(libroMayor.saldoInicialHaber) + nuevoMovimientosHaber;
        
        let saldoFinalDebe = 0;
        let saldoFinalHaber = 0;
        let saldoDeudor = 0;
        let saldoAcreedor = 0;
        
        if (totalDebe > totalHaber) {
          saldoFinalDebe = totalDebe - totalHaber;
          saldoDeudor = saldoFinalDebe;
        } else if (totalHaber > totalDebe) {
          saldoFinalHaber = totalHaber - totalDebe;
          saldoAcreedor = saldoFinalHaber;
        }

        // Actualizar el registro
        await libroMayor.update({
          movimientosDebe: nuevoMovimientosDebe,
          movimientosHaber: nuevoMovimientosHaber,
          saldoFinalDebe: saldoFinalDebe,
          saldoFinalHaber: saldoFinalHaber,
          saldoDeudor: saldoDeudor,
          saldoAcreedor: saldoAcreedor
        }, { transaction });
      }

    } catch (error) {
      console.error('Error al actualizar LibroMayor:', error);
      throw error;
    }
  }

  /**
   * Generar asiento contable automático para una compra
   */
  static async generarAsientoCompra(compraId, usuarioId, transaction = null) {
    try {
      const compra = await Compra.findByPk(compraId, {
        include: [
          { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento', 'contacto'] },
          { model: Sucursal, attributes: ['id', 'nombre'] }
        ],
        transaction
      });

      if (!compra) {
        throw new Error('Compra no encontrada');
      }

      // Generar número de asiento
      const fechaActual = moment().format('YYYY-MM-DD');
      const ultimoAsiento = await AsientoContable.findOne({
        where: {
          fecha: fechaActual,
          sucursalId: compra.sucursalId
        },
        order: [['numero', 'DESC']],
        transaction
      });

      const numeroAsiento = ultimoAsiento 
        ? `ASI-${String(parseInt(ultimoAsiento.numero.split('-')[1]) + 1).padStart(6, '0')}`
        : 'ASI-000001';

      // Crear asiento contable
      const asiento = await AsientoContable.create({
        numero: numeroAsiento,
        fecha: fechaActual,
        glosa: `Compra ${compra.tipoComprobante} ${compra.serieComprobante}-${compra.numeroComprobante}`,
        tipoOperacion: 'COMPRA',
        documentoReferencia: `${compra.serieComprobante}-${compra.numeroComprobante}`,
        compraId: compra.id,
        sucursalId: compra.sucursalId,
        usuarioId: usuarioId,
        estado: 'CONFIRMADO',
        esAutomatico: true
      }, { transaction });

      // Buscar cuentas contables necesarias
      const cuentaMercaderia = await PlanCuentas.findOne({ 
        where: { codigo: '201' }, // Mercaderías
        transaction 
      });
      const cuentaIGVCompras = await PlanCuentas.findOne({ 
        where: { codigo: '1212' }, // IGV por acreditar
        transaction 
      });
      const cuentaProveedores = await PlanCuentas.findOne({ 
        where: { codigo: '421' }, // Cuentas por pagar comerciales
        transaction 
      });

      if (!cuentaMercaderia || !cuentaIGVCompras || !cuentaProveedores) {
        throw new Error('No se encontraron las cuentas contables necesarias para compras');
      }

      const detalles = [];

      // Débito: Mercaderías (subtotal)
      detalles.push({
        asientoContableId: asiento.id,
        planCuentasId: cuentaMercaderia.id,
        orden: 1,
        glosa: `Compra de mercadería`,
        debe: parseFloat(compra.subtotal),
        haber: 0,
        proveedorId: compra.proveedorId,
        moneda: 'PEN'
      });

      // Débito: IGV por acreditar (si hay IGV)
      if (parseFloat(compra.igv) > 0) {
        detalles.push({
          asientoContableId: asiento.id,
          planCuentasId: cuentaIGVCompras.id,
          orden: 2,
          glosa: `IGV de la compra`,
          debe: parseFloat(compra.igv),
          haber: 0,
          proveedorId: compra.proveedorId,
          moneda: 'PEN'
        });
      }

      // Crédito: Cuentas por pagar (total)
      detalles.push({
        asientoContableId: asiento.id,
        planCuentasId: cuentaProveedores.id,
        orden: 3,
        glosa: `Deuda por compra a ${compra.Proveedor.nombre}`,
        debe: 0,
        haber: parseFloat(compra.total),
        proveedorId: compra.proveedorId,
        moneda: 'PEN'
      });

      // Crear detalles del asiento
      await DetalleAsiento.bulkCreate(detalles, { transaction });

      // Actualizar totales del asiento
      const totalDebe = detalles.reduce((sum, det) => sum + parseFloat(det.debe), 0);
      const totalHaber = detalles.reduce((sum, det) => sum + parseFloat(det.haber), 0);

      await asiento.update({
        totalDebe,
        totalHaber,
        diferencia: totalDebe - totalHaber
      }, { transaction });

      return asiento;

    } catch (error) {
      console.error('Error al generar asiento de compra:', error);
      throw error;
    }
  }

  /**
   * Obtener libro diario
   */
  static async obtenerLibroDiario(req, res) {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        sucursalId,
        tipoOperacion,
        page = 1, 
        limit = 50 
      } = req.query;

      const whereClause = {};
      
      if (fechaInicio && fechaFin) {
        whereClause.fecha = {
          [Op.between]: [fechaInicio, fechaFin]
        };
      }
      
      if (sucursalId) whereClause.sucursalId = sucursalId;
      if (tipoOperacion) whereClause.tipoOperacion = tipoOperacion;

      const offset = (page - 1) * limit;

      const { count, rows: asientos } = await AsientoContable.findAndCountAll({
        where: whereClause,
        include: [
          {
            model: DetalleAsiento,
            include: [
              {
                model: PlanCuentas,
                attributes: ['codigo', 'nombre']
              },
              {
                model: Cliente,
                attributes: ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'nombres'],
                required: false
              },
              {
                model: Proveedor,
                attributes: ['nombre', 'numeroDocumento', 'contacto'],
                required: false
              }
            ]
          },
          {
            model: Sucursal,
            attributes: ['nombre'],
            required: false
          },
          {
            model: Usuario,
            attributes: ['nombre', 'apellido'],
            required: false
          }
        ],
        order: [['fecha', 'DESC'], ['numero', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: asientos,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (error) {
      console.error('Error al obtener libro diario:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el libro diario',
        error: error.message
      });
    }
  }

  /**
   * Obtener libro mayor
   */
  static async obtenerLibroMayor(req, res) {
    try {
      const { 
        planCuentasId,
        periodo, // YYYY-MM
        sucursalId,
        fechaInicio,
        fechaFin
      } = req.query;

      if (!planCuentasId) {
        return res.status(400).json({
          success: false,
          message: 'El ID de la cuenta es requerido'
        });
      }

      const cuenta = await PlanCuentas.findByPk(planCuentasId);
      if (!cuenta) {
        return res.status(404).json({
          success: false,
          message: 'Cuenta no encontrada'
        });
      }

      // Construir filtros para los movimientos
      const whereAsiento = {};
      const whereDetalle = { planCuentasId };

      if (sucursalId) whereAsiento.sucursalId = sucursalId;
      
      if (periodo) {
        const [year, month] = periodo.split('-');
        const inicioMes = `${year}-${month}-01`;
        const finMes = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');
        whereAsiento.fecha = { [Op.between]: [inicioMes, finMes] };
      } else if (fechaInicio && fechaFin) {
        whereAsiento.fecha = { [Op.between]: [fechaInicio, fechaFin] };
      }

      // Obtener movimientos de la cuenta
      const movimientos = await DetalleAsiento.findAll({
        where: whereDetalle,
        include: [
          {
            model: AsientoContable,
            where: whereAsiento,
            include: [
              { model: Sucursal, attributes: ['nombre'], required: false }
            ]
          },
          {
            model: Cliente,
            attributes: ['nombre', 'apellidoPaterno', 'apellidoMaterno', 'nombres'],
            required: false
          },
          {
            model: Proveedor,
            attributes: ['nombre', 'numeroDocumento', 'contacto'],
            required: false
          }
        ],
        order: [
          [AsientoContable, 'fecha', 'ASC'],
          [AsientoContable, 'numero', 'ASC'],
          ['orden', 'ASC']
        ]
      });

      // Calcular saldos
      let saldoAcumulado = 0;
      const movimientosConSaldo = movimientos.map(mov => {
        const debe = parseFloat(mov.debe) || 0;
        const haber = parseFloat(mov.haber) || 0;
        
        if (cuenta.naturaleza === 'DEUDORA') {
          saldoAcumulado += debe - haber;
        } else {
          saldoAcumulado += haber - debe;
        }

        return {
          ...mov.toJSON(),
          saldoAcumulado: saldoAcumulado
        };
      });

      // Calcular totales
      const totalDebe = movimientos.reduce((sum, mov) => sum + parseFloat(mov.debe || 0), 0);
      const totalHaber = movimientos.reduce((sum, mov) => sum + parseFloat(mov.haber || 0), 0);

      res.json({
        success: true,
        data: {
          cuenta: cuenta,
          movimientos: movimientosConSaldo,
          resumen: {
            totalDebe,
            totalHaber,
            saldoFinal: saldoAcumulado,
            cantidadMovimientos: movimientos.length
          }
        }
      });

    } catch (error) {
      console.error('Error al obtener libro mayor:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener el libro mayor',
        error: error.message
      });
    }
  }

  /**
   * Generar balance de comprobación
   */
  static async generarBalanceComprobacion(req, res) {
    try {
      const { 
        fechaInicio, 
        fechaFin, 
        sucursalId,
        nivel = null 
      } = req.query;

      if (!fechaInicio || !fechaFin) {
        return res.status(400).json({
          success: false,
          message: 'Las fechas de inicio y fin son requeridas'
        });
      }

      // Obtener todas las cuentas
      const whereClauseCuentas = { estado: 'ACTIVO' };
      if (nivel) whereClauseCuentas.nivel = nivel;

      const cuentas = await PlanCuentas.findAll({
        where: whereClauseCuentas,
        order: [['codigo', 'ASC']]
      });

      // Obtener movimientos en el período
      const whereAsiento = {
        fecha: { [Op.between]: [fechaInicio, fechaFin] },
        estado: 'CONFIRMADO'
      };
      
      if (sucursalId) whereAsiento.sucursalId = sucursalId;

      const movimientos = await DetalleAsiento.findAll({
        include: [
          {
            model: AsientoContable,
            where: whereAsiento,
            attributes: []
          }
        ],
        attributes: [
          'planCuentasId',
          [sequelize.fn('SUM', sequelize.col('debe')), 'totalDebe'],
          [sequelize.fn('SUM', sequelize.col('haber')), 'totalHaber']
        ],
        group: ['planCuentasId'],
        raw: true
      });

      // Crear mapa de movimientos por cuenta
      const movimientosPorCuenta = {};
      movimientos.forEach(mov => {
        movimientosPorCuenta[mov.planCuentasId] = {
          totalDebe: parseFloat(mov.totalDebe) || 0,
          totalHaber: parseFloat(mov.totalHaber) || 0
        };
      });

      // Generar balance
      const balance = cuentas.map(cuenta => {
        const movs = movimientosPorCuenta[cuenta.id] || { totalDebe: 0, totalHaber: 0 };
        
        let saldoDeudor = 0;
        let saldoAcreedor = 0;
        
        const diferencia = movs.totalDebe - movs.totalHaber;
        
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
          cuenta: {
            id: cuenta.id,
            codigo: cuenta.codigo,
            nombre: cuenta.nombre,
            naturaleza: cuenta.naturaleza,
            tipo: cuenta.tipo
          },
          movimientos: {
            debe: movs.totalDebe,
            haber: movs.totalHaber
          },
          saldos: {
            deudor: saldoDeudor,
            acreedor: saldoAcreedor
          }
        };
      }).filter(item => item.movimientos.debe > 0 || item.movimientos.haber > 0);

      // Calcular totales
      const totales = balance.reduce((acc, item) => {
        acc.totalDebe += item.movimientos.debe;
        acc.totalHaber += item.movimientos.haber;
        acc.totalSaldoDeudor += item.saldos.deudor;
        acc.totalSaldoAcreedor += item.saldos.acreedor;
        return acc;
      }, {
        totalDebe: 0,
        totalHaber: 0,
        totalSaldoDeudor: 0,
        totalSaldoAcreedor: 0
      });

      res.json({
        success: true,
        data: {
          balance,
          totales,
          periodo: {
            fechaInicio,
            fechaFin
          },
          cuadrado: Math.abs(totales.totalDebe - totales.totalHaber) < 0.01 &&
                   Math.abs(totales.totalSaldoDeudor - totales.totalSaldoAcreedor) < 0.01
        }
      });

    } catch (error) {
      console.error('Error al generar balance de comprobación:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar el balance de comprobación',
        error: error.message
      });
    }
  }

  /**
   * Inicializar plan de cuentas básico
   */
  static async inicializarPlanCuentas(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      // Verificar si ya existe un plan de cuentas
      const cuentasExistentes = await PlanCuentas.count({ transaction });
      
      if (cuentasExistentes > 0) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: 'Ya existe un plan de cuentas configurado'
        });
      }

      // Plan de cuentas básico según PCGE (Plan Contable General Empresarial)
      const cuentasBasicas = [
        // ELEMENTO 1: ACTIVO DISPONIBLE Y EXIGIBLE
        { codigo: '10', nombre: 'EFECTIVO Y EQUIVALENTES DE EFECTIVO', nivel: 1, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: false, codigoSunat: '10' },
        { codigo: '101', nombre: 'Caja', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: true, codigoSunat: '101' },
        { codigo: '104', nombre: 'Cuentas corrientes en instituciones financieras', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: true, codigoSunat: '104' },
        
        { codigo: '12', nombre: 'CUENTAS POR COBRAR COMERCIALES - TERCEROS', nivel: 1, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: false, codigoSunat: '12' },
        { codigo: '121', nombre: 'Facturas, boletas y otros comprobantes por cobrar', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: true, codigoSunat: '121' },
        { codigo: '1212', nombre: 'IGV', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: true, codigoSunat: '1212' },
        
        // ELEMENTO 2: ACTIVO REALIZABLE
        { codigo: '20', nombre: 'MERCADERÍAS', nivel: 1, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: false, codigoSunat: '20' },
        { codigo: '201', nombre: 'Mercaderías manufacturadas', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'ACTIVO', esMovimiento: true, codigoSunat: '201' },
        
        // ELEMENTO 4: PASIVO
        { codigo: '40', nombre: 'TRIBUTOS, CONTRAPRESTACIONES Y APORTES AL SISTEMA DE PENSIONES Y DE SALUD POR PAGAR', nivel: 1, naturaleza: 'ACREEDORA', tipo: 'PASIVO', esMovimiento: false, codigoSunat: '40' },
        { codigo: '4011', nombre: 'IGV', nivel: 2, cuentaPadreId: null, naturaleza: 'ACREEDORA', tipo: 'PASIVO', esMovimiento: true, codigoSunat: '4011' },
        
        { codigo: '42', nombre: 'CUENTAS POR PAGAR COMERCIALES - TERCEROS', nivel: 1, naturaleza: 'ACREEDORA', tipo: 'PASIVO', esMovimiento: false, codigoSunat: '42' },
        { codigo: '421', nombre: 'Facturas, boletas y otros comprobantes por pagar', nivel: 2, cuentaPadreId: null, naturaleza: 'ACREEDORA', tipo: 'PASIVO', esMovimiento: true, codigoSunat: '421' },
        
        // ELEMENTO 5: PATRIMONIO
        { codigo: '50', nombre: 'CAPITAL', nivel: 1, naturaleza: 'ACREEDORA', tipo: 'PATRIMONIO', esMovimiento: false, codigoSunat: '50' },
        { codigo: '501', nombre: 'Capital social', nivel: 2, cuentaPadreId: null, naturaleza: 'ACREEDORA', tipo: 'PATRIMONIO', esMovimiento: true, codigoSunat: '501' },
        
        // ELEMENTO 6: GASTOS POR NATURALEZA
        { codigo: '60', nombre: 'COMPRAS', nivel: 1, naturaleza: 'DEUDORA', tipo: 'GASTO', esMovimiento: false, codigoSunat: '60' },
        { codigo: '601', nombre: 'Mercaderías', nivel: 2, cuentaPadreId: null, naturaleza: 'DEUDORA', tipo: 'GASTO', esMovimiento: true, codigoSunat: '601' },
        
        // ELEMENTO 7: INGRESOS
        { codigo: '70', nombre: 'VENTAS', nivel: 1, naturaleza: 'ACREEDORA', tipo: 'INGRESO', esMovimiento: false, codigoSunat: '70' },
        { codigo: '701', nombre: 'Mercaderías', nivel: 2, cuentaPadreId: null, naturaleza: 'ACREEDORA', tipo: 'INGRESO', esMovimiento: true, codigoSunat: '701' }
      ];

      // Crear cuentas de nivel 1 primero
      const cuentasNivel1 = cuentasBasicas.filter(c => c.nivel === 1);
      const cuentasCreadas = {};
      
      for (const cuenta of cuentasNivel1) {
        const nuevaCuenta = await PlanCuentas.create(cuenta, { transaction });
        cuentasCreadas[cuenta.codigo] = nuevaCuenta.id;
      }

      // Crear cuentas de nivel 2
      const cuentasNivel2 = cuentasBasicas.filter(c => c.nivel === 2);
      for (const cuenta of cuentasNivel2) {
        const codigoPadre = cuenta.codigo.substring(0, 2);
        cuenta.cuentaPadreId = cuentasCreadas[codigoPadre];
        await PlanCuentas.create(cuenta, { transaction });
      }

      await transaction.commit();

      res.json({
        success: true,
        message: 'Plan de cuentas inicializado exitosamente',
        cuentasCreadas: cuentasBasicas.length
      });

    } catch (error) {
      await transaction.rollback();
      console.error('Error al inicializar plan de cuentas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al inicializar el plan de cuentas',
        error: error.message
      });
    }
  }
}

module.exports = ContabilidadController;