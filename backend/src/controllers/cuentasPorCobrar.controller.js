const { CuentasPorCobrar, Cliente, Venta, Sucursal } = require('../models');
const { Op } = require('sequelize');
const sequelize = require('../config/database');

// Obtener todas las cuentas por cobrar
const obtenerCuentasPorCobrar = async (req, res) => {
  try {
    const { clienteId, estado, sucursalId, fechaDesde, fechaHasta } = req.query;

    // Construir condiciones de búsqueda
    const where = {};

    if (clienteId) {
      where.clienteId = clienteId;
    }

    if (estado) {
      where.estado = estado;
    }

    if (fechaDesde && fechaHasta) {
      where.fechaEmision = {
        [Op.between]: [new Date(fechaDesde), new Date(fechaHasta)]
      };
    }

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      // Si no es SuperAdmin, solo puede ver cuentas de su sucursal
      if (sucursalId && req.usuario.sucursalId !== parseInt(sucursalId)) {
        return res.status(403).json({ mensaje: 'No tiene permisos para ver cuentas de otras sucursales' });
      }
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    const cuentasPorCobrar = await CuentasPorCobrar.findAll({
      where,
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento', 'telefono', 'email']
        },
        {
          model: Venta,
          attributes: ['id', 'tipoComprobante', 'serieComprobante', 'numeroComprobante']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fechaVencimiento', 'ASC']]
    });

    res.json({ cuentasPorCobrar });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cuentas por cobrar', error: error.message });
  }
};

// Obtener resumen de deudas por cliente
const obtenerResumenDeudas = async (req, res) => {
  try {
    const { sucursalId } = req.query;

    // Construir condiciones de búsqueda
    const where = {
      estado: {
        [Op.in]: ['PENDIENTE', 'PAGADO_PARCIAL', 'VENCIDO']
      }
    };

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    const resumenDeudas = await CuentasPorCobrar.findAll({
      where,
      attributes: [
        'clienteId',
        [sequelize.fn('SUM', sequelize.col('CuentasPorCobrar.montoPendiente')), 'totalDeuda'],
        [sequelize.fn('COUNT', sequelize.col('CuentasPorCobrar.id')), 'cantidadDocumentos'],
        [sequelize.fn('MIN', sequelize.col('CuentasPorCobrar.fechaVencimiento')), 'fechaVencimientoMasAntigua']
      ],
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento', 'telefono', 'email']
        }
      ],
      group: ['clienteId', 'Cliente.id'],
      having: sequelize.where(sequelize.fn('SUM', sequelize.col('CuentasPorCobrar.montoPendiente')), '>', 0),
      order: [[sequelize.fn('SUM', sequelize.col('CuentasPorCobrar.montoPendiente')), 'DESC']]
    });

    res.json({ resumenDeudas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener resumen de deudas', error: error.message });
  }
};

// Obtener cuentas vencidas
const obtenerCuentasVencidas = async (req, res) => {
  try {
    const { sucursalId } = req.query;
    const hoy = new Date();

    // Construir condiciones de búsqueda
    const where = {
      fechaVencimiento: {
        [Op.lt]: hoy
      },
      estado: {
        [Op.in]: ['PENDIENTE', 'PAGADO_PARCIAL', 'VENCIDO']
      },
      montoPendiente: {
        [Op.gt]: 0
      }
    };

    // Verificar permisos
    if (req.usuario && req.usuario.rol !== 'SuperAdmin') {
      where.sucursalId = req.usuario.sucursalId;
    } else if (sucursalId) {
      where.sucursalId = sucursalId;
    }

    const cuentasVencidas = await CuentasPorCobrar.findAll({
      where,
      include: [
        {
          model: Cliente,
          attributes: ['id', 'nombre', 'numeroDocumento', 'tipoDocumento', 'telefono', 'email']
        },
        {
          model: Venta,
          attributes: ['id', 'tipoComprobante', 'serieComprobante', 'numeroComprobante']
        },
        {
          model: Sucursal,
          attributes: ['id', 'nombre']
        }
      ],
      order: [['fechaVencimiento', 'ASC']]
    });

    res.json({ cuentasVencidas });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener cuentas vencidas', error: error.message });
  }
};

// Registrar pago
const registrarPago = async (req, res) => {
  const { id } = req.params;
  const { montoPago, observaciones } = req.body;

  const t = await sequelize.transaction();

  try {
    // Verificar permisos
    if (req.usuario &&
      req.usuario.rol !== 'SuperAdmin' &&
      req.usuario.rol !== 'Admin' &&
      req.usuario.rol !== 'Cajero') {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para registrar pagos' });
    }

    // Buscar la cuenta por cobrar
    const cuentaPorCobrar = await CuentasPorCobrar.findByPk(id, { transaction: t });
    if (!cuentaPorCobrar) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Cuenta por cobrar no encontrada' });
    }

    // Verificar permisos de sucursal
    if (req.usuario.rol !== 'SuperAdmin' && cuentaPorCobrar.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para registrar pagos en otras sucursales' });
    }

    // Validar monto
    if (montoPago <= 0 || montoPago > cuentaPorCobrar.montoPendiente) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Monto de pago inválido' });
    }

    // Actualizar la cuenta por cobrar
    const nuevoMontoPagado = parseFloat(cuentaPorCobrar.montoPagado) + parseFloat(montoPago);
    const nuevoMontoPendiente = parseFloat(cuentaPorCobrar.montoOriginal) - nuevoMontoPagado;

    let nuevoEstado = 'PENDIENTE';
    if (nuevoMontoPendiente <= 0) {
      nuevoEstado = 'PAGADO_TOTAL';
    } else if (nuevoMontoPagado > 0) {
      nuevoEstado = 'PAGADO_PARCIAL';
    }

    await cuentaPorCobrar.update({
      montoPagado: nuevoMontoPagado,
      montoPendiente: Math.max(0, nuevoMontoPendiente),
      estado: nuevoEstado,
      observaciones: observaciones || cuentaPorCobrar.observaciones
    }, { transaction: t });

    await t.commit();

    res.json({
      mensaje: 'Pago registrado exitosamente',
      cuentaPorCobrar: await CuentasPorCobrar.findByPk(id, {
        include: [
          { model: Cliente, attributes: ['id', 'nombre', 'numeroDocumento'] },
          { model: Venta, attributes: ['id', 'tipoComprobante', 'serieComprobante', 'numeroComprobante'] }
        ]
      })
    });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al registrar el pago', error: error.message });
  }
};

// Crear cuenta por cobrar (automático al crear venta a crédito)
const crearCuentaPorCobrar = async (ventaData, transaction) => {
  try {
    // Solo crear cuenta por cobrar si la forma de pago es crédito
    if (ventaData.formaPago !== 'CREDITO') {
      return null;
    }

    const cuentaPorCobrar = await CuentasPorCobrar.create({
      clienteId: ventaData.clienteId,
      ventaId: ventaData.id,
      numeroDocumento: `${ventaData.serieComprobante}-${ventaData.numeroComprobante}`,
      tipoDocumento: ventaData.tipoComprobante,
      fechaEmision: ventaData.fechaVenta,
      fechaVencimiento: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días por defecto
      montoOriginal: ventaData.total,
      montoPagado: 0,
      montoPendiente: ventaData.total,
      estado: 'PENDIENTE',
      moneda: ventaData.moneda || 'PEN',
      sucursalId: ventaData.sucursalId
    }, { transaction });

    return cuentaPorCobrar;
  } catch (error) {
    throw new Error(`Error al crear cuenta por cobrar: ${error.message}`);
  }
};

module.exports = {
  obtenerCuentasPorCobrar,
  obtenerResumenDeudas,
  obtenerCuentasVencidas,
  registrarPago,
  crearCuentaPorCobrar
};