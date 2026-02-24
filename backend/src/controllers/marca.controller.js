const { Marca } = require('../models');

// Listar marcas con filtros y paginación básica
exports.listarMarcas = async (req, res) => {
  try {
    const { nombre = '', page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where = {};
    if (nombre) {
      where.nombre = { $like: `%${nombre}%` };
    }

    // Compatibilidad: Sequelize v6 usa Op.like
    const { Op } = require('sequelize');
    if (where.nombre) {
      where.nombre = { [Op.like]: `%${nombre}%` };
    }

    const { rows, count } = await Marca.findAndCountAll({
      where,
      offset,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({ data: rows, total: count });
  } catch (error) {
    console.error('Error al listar marcas:', error);
    res.status(500).json({ message: 'Error al listar marcas', error: error.message });
  }
};

// Obtener marca por ID
exports.obtenerMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await Marca.findByPk(id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    res.json(marca);
  } catch (error) {
    console.error('Error al obtener marca:', error);
    res.status(500).json({ message: 'Error al obtener marca', error: error.message });
  }
};

// Crear nueva marca
exports.crearMarca = async (req, res) => {
  try {
    const { nombre, imagen, estado = true } = req.body;
    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ message: 'El nombre es requerido' });
    }

    const existente = await Marca.findOne({ where: { nombre: nombre.trim() } });
    if (existente) {
      return res.status(409).json({ message: 'Ya existe una marca con ese nombre' });
    }

    const nueva = await Marca.create({ nombre: nombre.trim(), imagen: imagen || null, estado });
    res.status(201).json(nueva);
  } catch (error) {
    console.error('Error al crear marca:', error);
    res.status(500).json({ message: 'Error al crear marca', error: error.message });
  }
};

// Actualizar marca
exports.actualizarMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, imagen, estado } = req.body;
    const marca = await Marca.findByPk(id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });

    if (nombre && nombre.trim()) {
      const duplicada = await Marca.findOne({ where: { nombre: nombre.trim() } });
      if (duplicada && duplicada.id !== marca.id) {
        return res.status(409).json({ message: 'Ya existe una marca con ese nombre' });
      }
    }

    await marca.update({
      nombre: nombre !== undefined ? nombre.trim() : marca.nombre,
      imagen: imagen !== undefined ? imagen : marca.imagen,
      estado: estado !== undefined ? estado : marca.estado
    });

    res.json(marca);
  } catch (error) {
    console.error('Error al actualizar marca:', error);
    res.status(500).json({ message: 'Error al actualizar marca', error: error.message });
  }
};

// Eliminar marca
exports.eliminarMarca = async (req, res) => {
  try {
    const { id } = req.params;
    const marca = await Marca.findByPk(id);
    if (!marca) return res.status(404).json({ message: 'Marca no encontrada' });
    await marca.destroy();
    res.json({ message: 'Marca eliminada' });
  } catch (error) {
    console.error('Error al eliminar marca:', error);
    res.status(500).json({ message: 'Error al eliminar marca', error: error.message });
  }
};