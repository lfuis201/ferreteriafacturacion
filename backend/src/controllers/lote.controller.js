const { Lote, Producto, Almacen } = require('../models');
const { Op } = require('sequelize');

// Listar lotes con filtros y paginación
exports.listarLotes = async (req, res) => {
  try {
    const {
      filterBy = 'lote',
      query = '',
      productoId,
      almacenId,
      estado,
      page = 1,
      limit = 10
    } = req.query;

    const where = {};

    if (query) {
      if (filterBy === 'lote') {
        where.lote = { [Op.like]: `%${query}%` };
      } else if (filterBy === 'estado') {
        where.estado = { [Op.like]: `%${query}%` };
      }
    }
    if (productoId) where.productoId = productoId;
    if (almacenId) where.almacenId = almacenId;
    if (estado) where.estado = estado;

    const include = [];
    if (filterBy === 'producto' && query) {
      include.push({
        model: Producto,
        attributes: ['id', 'nombre'],
        where: { nombre: { [Op.like]: `%${query}%` } }
      });
    } else {
      include.push({ model: Producto, attributes: ['id', 'nombre'] });
    }

    if (filterBy === 'almacen' && query) {
      include.push({
        model: Almacen,
        attributes: ['id', 'nombre'],
        where: { nombre: { [Op.like]: `%${query}%` } }
      });
    } else {
      include.push({ model: Almacen, attributes: ['id', 'nombre'] });
    }

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Lote.findAndCountAll({
      where,
      include,
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({ data: rows, total: count });
  } catch (error) {
    console.error('Error al listar lotes:', error);
    res.status(500).json({ mensaje: 'Error al listar lotes', error: error.message });
  }
};

// Obtener lote por ID
exports.obtenerLote = async (req, res) => {
  try {
    const { id } = req.params;
    const lote = await Lote.findByPk(id, {
      include: [
        { model: Producto, attributes: ['id', 'nombre'] },
        { model: Almacen, attributes: ['id', 'nombre'] }
      ]
    });
    if (!lote) return res.status(404).json({ mensaje: 'Lote no encontrado' });
    res.json(lote);
  } catch (error) {
    console.error('Error al obtener lote:', error);
    res.status(500).json({ mensaje: 'Error al obtener lote', error: error.message });
  }
};

// Crear nuevo lote
exports.crearLote = async (req, res) => {
  try {
    const {
      lote,
      productoId,
      producto, // nombre opcional
      almacenId,
      almacen, // nombre opcional
      sucursalId, // opcional: si viene, usar/crear almacén por defecto
      fechaIngreso,
      vencimiento,
      estado = 'Activo',
      stock = 0,
      observaciones
    } = req.body;

    // Resolver productoId por nombre (búsqueda flexible) si no viene el ID
    let finalProductoId = productoId;
    if (!finalProductoId && producto) {
      const nombreProd = (producto || '').trim();
      const p = await Producto.findOne({
        where: { nombre: { [Op.like]: `%${nombreProd}%` } }
      });
      if (!p) {
        // Crear producto mínimo automáticamente para permitir el flujo desde Lotes
        const codigoAuto = `AUTO-${Date.now()}`;
        const nuevoProducto = await Producto.create({
          nombre: nombreProd,
          codigo: codigoAuto,
          descripcion: 'Creado automáticamente desde Lotes',
          precioCompra: 0,
          precioVenta: 0,
          unidadMedida: 'unidad',
          stock: 0,
          stockMinimo: 0,
          tieneIgv: true,
          estado: true
        });
        finalProductoId = nuevoProducto.id;
      } else {
        finalProductoId = p.id;
      }
    }

    // Resolver almacenId por nombre (búsqueda flexible) si no viene el ID
    let finalAlmacenId = almacenId;
    if (!finalAlmacenId && almacen) {
      const nombreAlm = (almacen || '').trim();
      const a = await Almacen.findOne({
        where: { nombre: { [Op.like]: `%${nombreAlm}%` } }
      });
      if (!a) return res.status(400).json({ mensaje: 'Almacén no encontrado por nombre' });
      finalAlmacenId = a.id;
    }

    // Si no hay almacenId y viene sucursalId, usar/crear almacén PRINCIPAL de la sucursal
    if (!finalAlmacenId && sucursalId) {
      let almacenPrincipal = await Almacen.findOne({
        where: { sucursalId, tipo: 'PRINCIPAL' }
      });
      if (!almacenPrincipal) {
        almacenPrincipal = await Almacen.create({
          nombre: 'PRINCIPAL',
          descripcion: 'Creado automáticamente desde Lotes',
          ubicacion: '',
          sucursalId,
          tipo: 'PRINCIPAL',
          estado: true
        });
      }
      finalAlmacenId = almacenPrincipal.id;
    }

    if (!lote || !finalProductoId || !finalAlmacenId) {
      return res.status(400).json({ mensaje: 'lote, producto (o productoId) y almacén (o almacenId) son requeridos' });
    }

    const creada = await Lote.create({
      lote,
      productoId: finalProductoId,
      almacenId: finalAlmacenId,
      fechaIngreso,
      vencimiento,
      estado,
      stock,
      observaciones
    });

    const completa = await Lote.findByPk(creada.id, {
      include: [
        { model: Producto, attributes: ['id', 'nombre'] },
        { model: Almacen, attributes: ['id', 'nombre'] }
      ]
    });
    res.status(201).json(completa);
  } catch (error) {
    console.error('Error al crear lote:', error);
    res.status(500).json({ mensaje: 'Error al crear lote', error: error.message });
  }
};

// Actualizar lote
exports.actualizarLote = async (req, res) => {
  try {
    const { id } = req.params;
    const { lote, productoId, producto, almacenId, almacen, fechaIngreso, vencimiento, estado, stock, observaciones } = req.body;
    const item = await Lote.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: 'Lote no encontrado' });

    // Resolver IDs por nombre si vienen como texto
    let finalProductoId = productoId;
    if (!finalProductoId && producto) {
      const p = await Producto.findOne({ where: { nombre: producto } });
      finalProductoId = p?.id ?? finalProductoId;
    }

    let finalAlmacenId = almacenId;
    if (!finalAlmacenId && almacen) {
      const a = await Almacen.findOne({ where: { nombre: almacen } });
      finalAlmacenId = a?.id ?? finalAlmacenId;
    }

    await item.update({
      lote: lote !== undefined ? lote : item.lote,
      productoId: finalProductoId !== undefined ? finalProductoId : item.productoId,
      almacenId: finalAlmacenId !== undefined ? finalAlmacenId : item.almacenId,
      fechaIngreso: fechaIngreso !== undefined ? fechaIngreso : item.fechaIngreso,
      vencimiento: vencimiento !== undefined ? vencimiento : item.vencimiento,
      estado: estado !== undefined ? estado : item.estado,
      stock: stock !== undefined ? stock : item.stock,
      observaciones: observaciones !== undefined ? observaciones : item.observaciones
    });

    const completa = await Lote.findByPk(item.id, {
      include: [
        { model: Producto, attributes: ['id', 'nombre'] },
        { model: Almacen, attributes: ['id', 'nombre'] }
      ]
    });
    res.json(completa);
  } catch (error) {
    console.error('Error al actualizar lote:', error);
    res.status(500).json({ mensaje: 'Error al actualizar lote', error: error.message });
  }
};

// Eliminar lote
exports.eliminarLote = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Lote.findByPk(id);
    if (!item) return res.status(404).json({ mensaje: 'Lote no encontrado' });
    await item.destroy();
    res.json({ mensaje: 'Lote eliminado' });
  } catch (error) {
    console.error('Error al eliminar lote:', error);
    res.status(500).json({ mensaje: 'Error al eliminar lote', error: error.message });
  }
};