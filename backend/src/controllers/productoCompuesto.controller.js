const { sequelize, ProductoCompuesto, ProductoCompuestoItem, Producto, Categoria, Sucursal } = require('../models');

// Listar productos compuestos con filtros
exports.obtenerProductosCompuestos = async (req, res) => {
  try {
    const { nombre } = req.query;
    const where = {};
    if (nombre) {
      where.nombre = { [require('sequelize').Op.like]: `%${nombre}%` };
    }

    const productos = await ProductoCompuesto.findAll({
      where,
      include: [
        { model: Categoria, attributes: ['id', 'nombre'] },
        { model: Sucursal, attributes: ['id', 'nombre'] },
        {
          model: ProductoCompuestoItem,
          include: [{ model: Producto, attributes: ['id', 'nombre', 'codigo'] }]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return res.json({ productos });
  } catch (error) {
    console.error('Error al obtener productos compuestos:', error);
    return res.status(500).json({ mensaje: 'Error al obtener productos compuestos' });
  }
};

// Crear producto compuesto
exports.crearProductoCompuesto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const datos = req.body;
    const {
      nombre,
      nombreSecundario,
      descripcion,
      modelo,
      unidad,
      moneda,
      precioUnitarioVenta,
      plataforma,
      almacen,
      imagen,
      tipoAfectacion,
      codigoSunat,
      codigoInterno,
      totalPCompra,
      precioUnitarioCompra,
      categoriaId,
      marca,
      sucursalId,
      productosAsociados = []
    } = datos;

    if (!nombre || !precioUnitarioVenta || !precioUnitarioCompra) {
      return res.status(400).json({ mensaje: 'Nombre, precios de venta y compra son obligatorios' });
    }

    const producto = await ProductoCompuesto.create({
      nombre,
      nombreSecundario,
      descripcion,
      modelo,
      unidad,
      moneda,
      precioUnitarioVenta,
      plataforma,
      almacen,
      imagen,
      tipoAfectacion,
      codigoSunat,
      codigoInterno,
      totalPCompra,
      precioUnitarioCompra,
      categoriaId: categoriaId || null,
      marca,
      sucursalId: sucursalId || null,
      estado: true
    }, { transaction: t });

    // Crear ítems asociados
    for (const item of productosAsociados) {
      if (!item.productoId || !item.cantidad) continue;
      await ProductoCompuestoItem.create({
        productoCompuestoId: producto.id,
        productoId: item.productoId,
        cantidad: item.cantidad
      }, { transaction: t });
    }

    await t.commit();
    return res.status(201).json({ mensaje: 'Producto compuesto creado', producto });
  } catch (error) {
    await t.rollback();
    console.error('Error al crear producto compuesto:', error);
    return res.status(500).json({ mensaje: 'Error al crear producto compuesto' });
  }
};

// Actualizar producto compuesto
exports.actualizarProductoCompuesto = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { id } = req.params;
    const datos = req.body;

    const existente = await ProductoCompuesto.findByPk(id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Producto compuesto no encontrado' });
    }

    await existente.update({
      nombre: datos.nombre ?? existente.nombre,
      nombreSecundario: datos.nombreSecundario ?? existente.nombreSecundario,
      descripcion: datos.descripcion ?? existente.descripcion,
      modelo: datos.modelo ?? existente.modelo,
      unidad: datos.unidad ?? existente.unidad,
      moneda: datos.moneda ?? existente.moneda,
      precioUnitarioVenta: datos.precioUnitarioVenta ?? existente.precioUnitarioVenta,
      plataforma: datos.plataforma ?? existente.plataforma,
      almacen: datos.almacen ?? existente.almacen,
      imagen: datos.imagen ?? existente.imagen,
      tipoAfectacion: datos.tipoAfectacion ?? existente.tipoAfectacion,
      codigoSunat: datos.codigoSunat ?? existente.codigoSunat,
      codigoInterno: datos.codigoInterno ?? existente.codigoInterno,
      totalPCompra: datos.totalPCompra ?? existente.totalPCompra,
      precioUnitarioCompra: datos.precioUnitarioCompra ?? existente.precioUnitarioCompra,
      categoriaId: datos.categoriaId ?? existente.categoriaId,
      marca: datos.marca ?? existente.marca,
      sucursalId: datos.sucursalId ?? existente.sucursalId
    }, { transaction: t });

    // Reemplazar ítems asociados si vienen en payload
    if (Array.isArray(datos.productosAsociados)) {
      await ProductoCompuestoItem.destroy({ where: { productoCompuestoId: id }, transaction: t });
      for (const item of datos.productosAsociados) {
        if (!item.productoId || !item.cantidad) continue;
        await ProductoCompuestoItem.create({
          productoCompuestoId: id,
          productoId: item.productoId,
          cantidad: item.cantidad
        }, { transaction: t });
      }
    }

    await t.commit();
    return res.json({ mensaje: 'Producto compuesto actualizado', producto: existente });
  } catch (error) {
    await t.rollback();
    console.error('Error al actualizar producto compuesto:', error);
    return res.status(500).json({ mensaje: 'Error al actualizar producto compuesto' });
  }
};

// Eliminar producto compuesto
exports.eliminarProductoCompuesto = async (req, res) => {
  try {
    const { id } = req.params;
    const existente = await ProductoCompuesto.findByPk(id);
    if (!existente) {
      return res.status(404).json({ mensaje: 'Producto compuesto no encontrado' });
    }
    await existente.destroy();
    return res.json({ mensaje: 'Producto compuesto eliminado' });
  } catch (error) {
    console.error('Error al eliminar producto compuesto:', error);
    return res.status(500).json({ mensaje: 'Error al eliminar producto compuesto' });
  }
};