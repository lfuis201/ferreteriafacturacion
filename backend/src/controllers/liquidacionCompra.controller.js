const { LiquidacionCompra, Proveedor } = require('../models');
const { Op } = require('sequelize');

exports.obtenerLiquidaciones = async (req, res) => {
  try {
    const { numero, fechaEmision, vendedor, estado, proveedorId } = req.query;
    const where = {};
    if (numero) where.numero = { [Op.like]: `%${numero}%` };
    if (fechaEmision) where.fechaEmision = fechaEmision;
    if (vendedor) where.vendedor = { [Op.like]: `%${vendedor}%` };
    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = proveedorId;

    const liquidaciones = await LiquidacionCompra.findAll({
      where,
      order: [['createdAt', 'DESC']],
      include: [{ model: Proveedor, attributes: ['id', 'nombre', 'numeroDocumento'] }]
    });
    res.json({ liquidaciones });
  } catch (error) {
    console.error('Error obteniendo liquidaciones:', error);
    res.status(500).json({ mensaje: 'Error interno al listar liquidaciones', error: error.message });
  }
};

exports.buscarLiquidaciones = async (req, res) => {
  try {
    const { numero, fechaEmision, vendedor, estado, proveedorId } = req.query;
    const where = {};
    if (numero) where.numero = { [Op.like]: `%${numero}%` };
    if (fechaEmision) where.fechaEmision = fechaEmision;
    if (vendedor) where.vendedor = { [Op.like]: `%${vendedor}%` };
    if (estado) where.estado = estado;
    if (proveedorId) where.proveedorId = proveedorId;

    const liquidaciones = await LiquidacionCompra.findAll({ where, order: [['createdAt', 'DESC']] });
    res.json({ liquidaciones });
  } catch (error) {
    console.error('Error buscando liquidaciones:', error);
    res.status(500).json({ mensaje: 'Error interno al buscar liquidaciones', error: error.message });
  }
};

exports.obtenerLiquidacionPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const liquidacion = await LiquidacionCompra.findByPk(id);
    if (!liquidacion) return res.status(404).json({ mensaje: 'Liquidación no encontrada' });
    res.json({ liquidacion });
  } catch (error) {
    console.error('Error obteniendo liquidación:', error);
    res.status(500).json({ mensaje: 'Error interno al obtener liquidación', error: error.message });
  }
};

exports.crearLiquidacion = async (req, res) => {
  try {
    const data = req.body;
    const nueva = await LiquidacionCompra.create({
      tipoComprobante: data.tipoComprobante || 'LIQUIDACIÓN DE COMPRA',
      serie: data.serie || null,
      numero: data.numero || null,
      fechaEmision: data.fechaEmision,
      proveedorId: data.proveedorId || null,
      vendedor: data.vendedor || null,
      moneda: data.moneda || 'PEN',
      tipoCambio: data.tipoCambio || null,
      observaciones: data.observaciones || null,
      condicionPago: data.condicionPago || null,
      estado: data.estado || 'PENDIENTE',
      tInafecto: data.tInafecto || 0,
      tExonerado: data.tExonerado || 0,
      tGravado: data.tGravado || 0,
      tIgv: data.tIgv || 0,
      total: data.total || 0,
    });
    res.status(201).json({ mensaje: 'Liquidación creada', liquidacion: nueva });
  } catch (error) {
    console.error('Error creando liquidación:', error);
    res.status(500).json({ mensaje: 'Error interno al crear liquidación', error: error.message });
  }
};

exports.actualizarLiquidacion = async (req, res) => {
  try {
    const { id } = req.params;
    const liquidacion = await LiquidacionCompra.findByPk(id);
    if (!liquidacion) return res.status(404).json({ mensaje: 'Liquidación no encontrada' });

    await liquidacion.update(req.body);
    res.json({ mensaje: 'Liquidación actualizada', liquidacion });
  } catch (error) {
    console.error('Error actualizando liquidación:', error);
    res.status(500).json({ mensaje: 'Error interno al actualizar liquidación', error: error.message });
  }
};

exports.eliminarLiquidacion = async (req, res) => {
  try {
    const { id } = req.params;
    const liquidacion = await LiquidacionCompra.findByPk(id);
    if (!liquidacion) return res.status(404).json({ mensaje: 'Liquidación no encontrada' });
    await liquidacion.destroy();
    res.json({ mensaje: 'Liquidación eliminada' });
  } catch (error) {
    console.error('Error eliminando liquidación:', error);
    res.status(500).json({ mensaje: 'Error interno al eliminar liquidación', error: error.message });
  }
};