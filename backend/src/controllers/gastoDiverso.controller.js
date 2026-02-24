const { sequelize, GastoDiverso, DetalleGastoDiverso, MetodoGastoDiverso, Proveedor, Sucursal, Usuario } = require('../models');
const { Op } = require('sequelize');

// Utilidades de normalización para entrada del formulario
const normalizeMoneda = (moneda) => {
  const m = (moneda || '').toString().trim().toUpperCase();
  if (['USD', 'DOLARES', 'DÓLARES', 'DOLAR', 'DÓLAR', 'DOLLAR'].includes(m)) return 'USD';
  return 'PEN';
};

const parseFechaEmision = (fecha) => {
  if (!fecha) return null;
  // Formato ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  // Formato DD/MM/YYYY
  const m = fecha.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) {
    const dd = parseInt(m[1], 10);
    const mm = parseInt(m[2], 10);
    const yyyy = m[3];
    if (mm >= 1 && mm <= 12 && dd >= 1 && dd <= 31) {
      const dStr = String(dd).padStart(2, '0');
      const mStr = String(mm).padStart(2, '0');
      return `${yyyy}-${mStr}-${dStr}`;
    }
  }
  return null;
};

// Listar gastos con filtros
exports.obtenerGastos = async (req, res) => {
  try {
    const { fecha, q, page = 1, limit = 20 } = req.query;
    const where = {};

    if (fecha) {
      where.fechaEmision = fecha;
    }
    if (q) {
      where[Op.or] = [
        { motivo: { [Op.like]: `%${q}%` } },
        { numero: { [Op.like]: `%${q}%` } }
      ];
    }

    // Si no es SuperAdmin, filtra por sucursal del usuario
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && req.usuario.sucursalId) {
      where.sucursalId = req.usuario.sucursalId;
    }

    const { rows, count } = await GastoDiverso.findAndCountAll({
      where,
      include: [
        { model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'], required: false },
      ],
      order: [['fechaEmision', 'DESC'], ['id', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit),
      distinct: true,
      subQuery: false
    });

    res.json({
      gastos: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error al obtener gastos diversos:', error);
    res.status(500).json({ mensaje: 'Error al obtener gastos', error: error.message });
  }
};

// Obtener gasto por id
exports.obtenerGastoPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const gasto = await GastoDiverso.findByPk(id, {
      include: [
        { model: Proveedor },
        { model: DetalleGastoDiverso },
        { model: MetodoGastoDiverso }
      ]
    });
    if (!gasto) return res.status(404).json({ mensaje: 'Gasto no encontrado' });

    // Validar permisos de sucursal
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && gasto.sucursalId !== req.usuario.sucursalId) {
      return res.status(403).json({ mensaje: 'No tiene permisos para ver gastos de otra sucursal' });
    }

    res.json(gasto);
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener gasto', error: error.message });
  }
};

// Crear gasto
exports.crearGasto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      tipoComprobante,
      numero,
      moneda,
      tipoCambio,
      fechaEmision,
      proveedorId,
      motivo,
      periodo,
      metodosGasto = [],
      detalles = []
    } = req.body;

    // Normalizar y validar fecha
    const fechaISO = parseFechaEmision(fechaEmision);
    if (!fechaISO) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Fecha de emisión inválida. Use YYYY-MM-DD o DD/MM/YYYY.' });
    }

    // Normalizar moneda y tipo de cambio
    const monedaNorm = normalizeMoneda(moneda);
    const tipoCambioVal = monedaNorm === 'USD' ? parseFloat(tipoCambio || 0) : null;

    const sucursalId = req.usuario?.sucursalId || null;
    const usuarioId = req.usuario?.id || null;

    // Validaciones de contexto de usuario
    if (!usuarioId) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'Usuario no identificado en el token. Inicie sesión nuevamente.' });
    }
    if (!sucursalId) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El usuario debe tener una sucursal asignada para registrar gastos.' });
    }

    // Validar existencia de Sucursal y Usuario en BD (evitar error de FK)
    const sucursal = await Sucursal.findByPk(sucursalId, { transaction: t });
    if (!sucursal) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'La sucursal asignada al usuario no existe. Verifique configuración.' });
    }
    const usuario = await Usuario.findByPk(usuarioId, { transaction: t });
    if (!usuario) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El usuario no existe. Inicie sesión nuevamente o contacte al administrador.' });
    }
    if (usuario.sucursalId !== sucursalId) {
      await t.rollback();
      return res.status(400).json({ mensaje: 'El usuario no está asignado a la sucursal actual.' });
    }
    if (proveedorId) {
      const proveedor = await Proveedor.findByPk(proveedorId, { transaction: t });
      if (!proveedor) {
        await t.rollback();
        return res.status(400).json({ mensaje: 'El proveedor seleccionado no existe.' });
      }
    }

    const nuevoGasto = await GastoDiverso.create({
      tipoComprobante,
      numero,
      moneda: monedaNorm,
      tipoCambio: tipoCambioVal,
      fechaEmision: fechaISO,
      proveedorId: proveedorId || null,
      motivo: motivo || null,
      periodo: periodo || null,
      total: 0,
      estado: 'REGISTRADO',
      sucursalId,
      usuarioId
    }, { transaction: t });

    // Insertar detalles
    let total = 0;
    for (const d of detalles) {
      const det = await DetalleGastoDiverso.create({
        gastoDiversoId: nuevoGasto.id,
        descripcion: d.descripcion,
        total: parseFloat(d.total || 0)
      }, { transaction: t });
      total += parseFloat(det.total);
    }

    // Insertar métodos de gasto
    for (const m of metodosGasto) {
      await MetodoGastoDiverso.create({
        gastoDiversoId: nuevoGasto.id,
        metodo: m.metodo,
        destino: m.destino || null,
        referencia: m.referencia || null,
        glosa: m.glosa || null,
        monto: parseFloat(m.monto || 0)
      }, { transaction: t });
    }

    // Actualizar total
    await nuevoGasto.update({ total }, { transaction: t });

    await t.commit();
    res.status(201).json(nuevoGasto);
  } catch (error) {
    await t.rollback();
    console.error('Error al crear gasto diverso:', error);
    res.status(500).json({ mensaje: 'Error al crear gasto', error: error.message });
  }
};

// Actualizar gasto
exports.actualizarGasto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const {
      tipoComprobante,
      numero,
      moneda,
      tipoCambio,
      fechaEmision,
      proveedorId,
      motivo,
      periodo,
      metodosGasto = [],
      detalles = []
    } = req.body;

    const gasto = await GastoDiverso.findByPk(id);
    if (!gasto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && gasto.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para editar gastos de otra sucursal' });
    }

    await gasto.update({
      tipoComprobante: tipoComprobante ?? gasto.tipoComprobante,
      numero: numero ?? gasto.numero,
      moneda: moneda ? (moneda === 'USD' ? 'USD' : 'PEN') : gasto.moneda,
      tipoCambio: moneda === 'USD' ? (tipoCambio || gasto.tipoCambio || 0) : null,
      fechaEmision: fechaEmision ?? gasto.fechaEmision,
      proveedorId: proveedorId ?? gasto.proveedorId,
      motivo: motivo ?? gasto.motivo,
      periodo: periodo ?? gasto.periodo
    }, { transaction: t });

    // Reemplazar detalles
    await DetalleGastoDiverso.destroy({ where: { gastoDiversoId: id }, transaction: t });
    let total = 0;
    for (const d of detalles) {
      const det = await DetalleGastoDiverso.create({
        gastoDiversoId: id,
        descripcion: d.descripcion,
        total: parseFloat(d.total || 0)
      }, { transaction: t });
      total += parseFloat(det.total);
    }

    // Reemplazar métodos
    await MetodoGastoDiverso.destroy({ where: { gastoDiversoId: id }, transaction: t });
    for (const m of metodosGasto) {
      await MetodoGastoDiverso.create({
        gastoDiversoId: id,
        metodo: m.metodo,
        destino: m.destino || null,
        referencia: m.referencia || null,
        glosa: m.glosa || null,
        monto: parseFloat(m.monto || 0)
      }, { transaction: t });
    }

    await gasto.update({ total }, { transaction: t });

    await t.commit();
    res.json(gasto);
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al actualizar gasto', error: error.message });
  }
};

// Eliminar gasto
exports.eliminarGasto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const gasto = await GastoDiverso.findByPk(id);
    if (!gasto) {
      await t.rollback();
      return res.status(404).json({ mensaje: 'Gasto no encontrado' });
    }
    if (req.usuario && req.usuario.rol !== 'SuperAdmin' && gasto.sucursalId !== req.usuario.sucursalId) {
      await t.rollback();
      return res.status(403).json({ mensaje: 'No tiene permisos para eliminar gastos de otra sucursal' });
    }

    await DetalleGastoDiverso.destroy({ where: { gastoDiversoId: id }, transaction: t });
    await MetodoGastoDiverso.destroy({ where: { gastoDiversoId: id }, transaction: t });
    await gasto.destroy({ transaction: t });
    await t.commit();
    res.json({ mensaje: 'Gasto eliminado correctamente' });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ mensaje: 'Error al eliminar gasto', error: error.message });
  }
};