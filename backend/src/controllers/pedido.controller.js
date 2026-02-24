const { sequelize, Pedido, DetallePedido, Cliente } = require('../models');

// Listar pedidos
exports.listarPedidos = async (req, res) => {
  try {
    const pedidos = await Pedido.findAll({
      include: [
        { model: DetallePedido },
        { model: Cliente }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json({ pedidos });
  } catch (error) {
    console.error('Error al listar pedidos:', error);
    res.status(500).json({ mensaje: 'Error al listar pedidos' });
  }
};

// Crear pedido con detalles
exports.crearPedido = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const {
      clienteId,
      usuarioId,
      sucursalId,
      fechaEmision,
      fechaVencimiento,
      fechaEntrega,
      direccionEnvio,
      vendedor,
      condicionPago,
      observacion,
      terminoPago,
      moneda,
      tipoCambio,
      empresaTransporte,
      productos = []
    } = req.body;

    // Calcular totales básicos
    const tGravado = productos.reduce((acc, p) => acc + Number(p.subtotal || (Number(p.cantidad||0) * Number(p.precioUnitario||0))), 0);
    const tIgv = Number((tGravado * 0.18).toFixed(2));
    const total = Number((tGravado + tIgv).toFixed(2));

    const nuevoPedido = await Pedido.create({
      clienteId,
      usuarioId,
      sucursalId,
      fechaEmision,
      fechaVencimiento,
      fechaEntrega,
      direccionEnvio,
      vendedor,
      condicionPago,
      observacion,
      terminoPago,
      moneda,
      tipoCambio,
      empresaTransporte,
      tGravado,
      tIgv,
      total,
      estado: 'PENDIENTE'
    }, { transaction: t });

    // Crear detalles
    for (const prod of productos) {
      await DetallePedido.create({
        pedidoId: nuevoPedido.id,
        productoId: prod.productoId || null,
        descripcion: prod.descripcion,
        unidad: prod.unidad,
        cantidad: prod.cantidad,
        precioUnitario: prod.precioUnitario,
        subtotal: prod.subtotal ?? Number((Number(prod.cantidad||0) * Number(prod.precioUnitario||0)).toFixed(2)),
        total: prod.total ?? prod.subtotal ?? Number((Number(prod.cantidad||0) * Number(prod.precioUnitario||0)).toFixed(2))
      }, { transaction: t });
    }

    await t.commit();
    const creado = await Pedido.findByPk(nuevoPedido.id, { include: [DetallePedido, Cliente] });
    res.status(201).json({ pedido: creado });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear pedido:', error);
    res.status(500).json({ mensaje: 'Error al crear pedido' });
  }
};

// Obtener un pedido por ID
exports.obtenerPedido = async (req, res) => {
  try {
    const { id } = req.params;
    const pedido = await Pedido.findByPk(id, { include: [DetallePedido, Cliente] });
    if (!pedido) return res.status(404).json({ mensaje: 'Pedido no encontrado' });
    res.json({ pedido });
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    res.status(500).json({ mensaje: 'Error al obtener pedido' });
  }
};