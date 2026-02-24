const { Serie, Producto } = require('../models');
const { Op } = require('sequelize');

// Listar series con filtros y paginación
exports.listarSeries = async (req, res) => {
  try {
    const { filterBy = 'serie', query = '', page = 1, limit = 10 } = req.query;
    const where = {};

    if (query) {
      if (filterBy === 'serie') {
        where.serie = { [Op.like]: `%${query}%` };
      } else if (filterBy === 'estado') {
        where.estado = { [Op.like]: `%${query}%` };
      }
    }

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

    const offset = (Number(page) - 1) * Number(limit);
    const { rows, count } = await Serie.findAndCountAll({
      where,
      include,
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({ data: rows, total: count });
  } catch (error) {
    console.error('Error al listar series:', error);
    res.status(500).json({ message: 'Error al listar series', error: error.message });
  }
};

// Obtener serie por ID
exports.obtenerSerie = async (req, res) => {
  try {
    const { id } = req.params;
    const serie = await Serie.findByPk(id, { include: [{ model: Producto, attributes: ['id', 'nombre'] }] });
    if (!serie) return res.status(404).json({ message: 'Serie no encontrada' });
    res.json(serie);
  } catch (error) {
    console.error('Error al obtener serie:', error);
    res.status(500).json({ message: 'Error al obtener serie', error: error.message });
  }
};

// Crear nueva serie
exports.crearSerie = async (req, res) => {
  try {
    const { serie, productoId, fecha, estado = 'Activo', vendido = false, observaciones } = req.body;
    if (!serie || !productoId || !fecha) {
      return res.status(400).json({ message: 'serie, productoId y fecha son requeridos' });
    }

    const existe = await Serie.findOne({ where: { serie } });
    if (existe) return res.status(409).json({ message: 'Ya existe una serie con ese número' });

    const creada = await Serie.create({ serie, productoId, fecha, estado, vendido, observaciones });
    const completa = await Serie.findByPk(creada.id, { include: [{ model: Producto, attributes: ['id', 'nombre'] }] });
    res.status(201).json(completa);
  } catch (error) {
    console.error('Error al crear serie:', error);
    res.status(500).json({ message: 'Error al crear serie', error: error.message });
  }
};

// Actualizar serie
exports.actualizarSerie = async (req, res) => {
  try {
    const { id } = req.params;
    const { serie, productoId, fecha, estado, vendido, observaciones } = req.body;
    const item = await Serie.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Serie no encontrada' });

    if (serie) {
      const duplicada = await Serie.findOne({ where: { serie } });
      if (duplicada && duplicada.id !== item.id) {
        return res.status(409).json({ message: 'Ya existe una serie con ese número' });
      }
    }

    await item.update({
      serie: serie !== undefined ? serie : item.serie,
      productoId: productoId !== undefined ? productoId : item.productoId,
      fecha: fecha !== undefined ? fecha : item.fecha,
      estado: estado !== undefined ? estado : item.estado,
      vendido: vendido !== undefined ? vendido : item.vendido,
      observaciones: observaciones !== undefined ? observaciones : item.observaciones
    });

    const completa = await Serie.findByPk(item.id, { include: [{ model: Producto, attributes: ['id', 'nombre'] }] });
    res.json(completa);
  } catch (error) {
    console.error('Error al actualizar serie:', error);
    res.status(500).json({ message: 'Error al actualizar serie', error: error.message });
  }
};

// Eliminar serie
exports.eliminarSerie = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await Serie.findByPk(id);
    if (!item) return res.status(404).json({ message: 'Serie no encontrada' });
    await item.destroy();
    res.json({ message: 'Serie eliminada' });
  } catch (error) {
    console.error('Error al eliminar serie:', error);
    res.status(500).json({ message: 'Error al eliminar serie', error: error.message });
  }
};